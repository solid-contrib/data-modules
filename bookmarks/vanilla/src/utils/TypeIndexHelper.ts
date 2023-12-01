import {
    ThingPersisted,
    addNamedNode,
    buildThing,
    createThing,
    getNamedNode,
    getSolidDataset,
    getThing,
    getThingAll,
    saveSolidDatasetAt,
    setThing
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import {
    BOOKMARK, RDF,
} from "@inrupt/vocab-common-rdf";
import { namedNode } from '@rdfjs/data-model';
import { __Bookmark, __foafPerson, __forClass, __privateTypeIndex, __publicTypeIndex, __schemaPerson, __solidTypeRegistration, __solid_instance, __solid_instance_container } from "../constants";
import { NamedNode } from '@rdfjs/types'

export class TypeIndexHelper {

    /**
     * Retrieves the profile of the authenticated user.
     *
     * @param {Session} session - The user session object.
     * @return {Promise<ThingPersisted | null | undefined>} The profile of the user if found, otherwise null or undefined.
     * @internal
     */
    public static async getMeProfile(session: Session): Promise<ThingPersisted | null | undefined> {
        if (!session.info.webId) return;

        const profileDS = await getSolidDataset(session.info.webId, { fetch: session.fetch });

        let me = getThing(profileDS, session.info.webId);

        if (!me) {
            const meThing = buildThing(createThing({ name: "me" }))
                .addUrl(RDF.type, __foafPerson)
                .addUrl(RDF.type, __schemaPerson)
                .build();

            const updatedProfile = setThing(profileDS, meThing);

            const updatedProfileDS = await saveSolidDatasetAt(session.info.webId!, updatedProfile, { fetch: session.fetch });

            me = getThing(updatedProfileDS, session.info.webId);
        }

        return me;
    }


    /**
     * Retrieves the type index for a given session and private flag.
     *
     * @param {Session} session - The session object.
     * @param {boolean} isPrivate - Flag indicating whether the type index is private.
     * @return {Promise<NamedNode<string> | null>} The type index or null if not found.
     * @internal
     */
    public static async getTypeIndex(session: Session, isPrivate: boolean): Promise<NamedNode<string> | null> {
        const me = await this.getMeProfile(session)

        const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);
        const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);
        const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

        if (me) {

            let typeIndex = getNamedNode(me, typeIndexPredicate)

            if (typeIndex) return typeIndex;

            await TypeIndexHelper.addTypeIndexToProfile(session, me, isPrivate);

            const _me = await this.getMeProfile(session) // maybe this is not needed, me already updated, need to check

            typeIndex = getNamedNode(_me!, typeIndexPredicate)

            return typeIndex

        } else {

            await this.createTypeIndex(session, typeIndexUrl);

            const profileDS = await getSolidDataset(session.info.webId!, { fetch: session.fetch });

            const meThing = buildThing(createThing({ name: "me" }))
                .addNamedNode(typeIndexPredicate, namedNode(typeIndexUrl))
                .addUrl(RDF.type, __foafPerson)
                .addUrl(RDF.type, __schemaPerson)
                .build();

            const updated = setThing(profileDS, meThing);

            await saveSolidDatasetAt(session.info.webId!, updated, { fetch: session.fetch });

            const typeIndex = getNamedNode(meThing, typeIndexPredicate);

            return typeIndex;
        }
    }


    /**
     * Adds a type index to the profile.
     *
     * @param {Session} session - The session object.
     * @param {ThingPersisted} me - The persisted thing object.
     * @param {boolean} isPrivate - A flag indicating whether the type index is private.
     * @return {Promise<boolean>} A promise that resolves to true if the type index is added successfully.
     * @internal
     */
    public static async addTypeIndexToProfile(session: Session, me: ThingPersisted, isPrivate: boolean): Promise<boolean> {
        const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);
        const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);
        const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

        await this.createTypeIndex(session, typeIndexUrl);

        const updatedMe = addNamedNode(me, typeIndexPredicate, namedNode(typeIndexUrl));

        try {
            const ds = await getSolidDataset(typeIndexUrl, { fetch: session.fetch });
            const updated = setThing(ds, updatedMe);
            await saveSolidDatasetAt(typeIndexUrl, updated, { fetch: session.fetch });
            return true
        } catch (error) {
            throw error;
        }
    }


    /**
     * Retrieves an array of strings from the type index.
     *
     * @param {Session} session - The session object.
     * @param {boolean} isPrivate - Indicates if the type index is private.
     * @return {Promise<string[]>} An array of strings retrieved from the type index.
     * @internal
     */
    public static async getFromTypeIndex(session: Session, isPrivate: true): Promise<string[]> {
        const typeIndex = await this.getTypeIndex(session, isPrivate);

        if (!typeIndex) return [];

        const ds = await getSolidDataset(typeIndex?.value, { fetch: session.fetch });

        const all = getThingAll(ds);

        const instances: string[] = []
        const instanceContainers: string[] = []


        all.forEach(x => {
            const forClass = getNamedNode(x, __forClass)

            if (forClass?.value === BOOKMARK.Bookmark) {

                const instance = getNamedNode(x, __solid_instance)?.value
                const instanceContainer = getNamedNode(x, __solid_instance_container)?.value

                instance && instances?.push(instance)
                instanceContainer && instanceContainers?.push(instanceContainer)
            }
        })

        const instanceContainersPromises = instanceContainers.map(async (instanceContainer) => {
            const ds = await getSolidDataset(instanceContainer, { fetch: session.fetch })
            const all = getThingAll(ds);

            const urls = all.map(x => x.url)
            const index = urls.findIndex(x => x === instanceContainer)

            return urls.splice(index, 1)
        })

        const innerInstances = (await Promise.all([...instanceContainersPromises])).flat();

        const responce: string[] = [...new Set([...instances, ...innerInstances])]

        return responce
    }



    /**
     * Registers the session in the type index.
     *
     * @param {Session} session - The session object.
     * @param {string} indexUrl - The URL of the type index.
     * @param {boolean} isPrivate - Indicates if the type index is private.
     * @return {Promise<true | undefined>} A promise that resolves to true if the registration is successful, or undefined if there is an error.
     * @internal
     */
    public static async registerInTypeIndex(session: Session, indexUrl: string, isPrivate: boolean): Promise<true | undefined> {
        const typeIndex = await this.getTypeIndex(session, isPrivate)

        if (!typeIndex) return // TODO validate

        const ds = await getSolidDataset(typeIndex?.value, { fetch: session.fetch })

        const bookmarkThing = buildThing(createThing({ name: "bookmarks_registery" }))
            .addNamedNode(__forClass, namedNode(__Bookmark))
            .addNamedNode(__solid_instance, namedNode(indexUrl))
            .addUrl(RDF.type, __solidTypeRegistration)
            .build();

        const updatedBookmarkList = setThing(ds, bookmarkThing);

        await saveSolidDatasetAt(typeIndex?.value, updatedBookmarkList, { fetch: session.fetch });

        return true
    }




    /**
     * Creates a type index using the provided session and typeIndexUrl.
     *
     * @param {Session} session - The session object used to fetch the type index.
     * @param {string} typeIndexUrl - The URL of the type index.
     * @return {Promise<true | undefined>} A promise that resolves to true if the type index is created successfully, or undefined otherwise.
     * @internal
     */
    public static async createTypeIndex(session: Session, typeIndexUrl: string): Promise<true | undefined> {

        try {
            await session.fetch(typeIndexUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "text/turtle",
                },
                body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.\n\n<> a solid:TypeIndex, solid:UnlistedDocument.`
            })
            return true
        } catch (error) {

        }
    }



    /**
     * Returns the file name of the type index based on the given flag.
     *
     * @param {boolean} isPrivate - Indicates whether the type index is private or public.
     * @return {string} The file name of the type index.
     * @internal
     */
    public static getTypeIndexFileName(isPrivate: boolean) {
        return isPrivate ? "privateTypeIndex" : "publicTypeIndex";
    }




    /**
     * Returns the type index predicate based on the value of isPrivate.
     *
     * @param {boolean} isPrivate - The flag indicating whether the type index is private.
     * @return {string} The type index predicate.
     * @internal
     */
    public static getTypeIndexPredicate(isPrivate: boolean): string {
        return isPrivate ? __privateTypeIndex : __publicTypeIndex;
    }


    /**
     * Returns the URL for the type index file.
     *
     * @param {Session} session - The session object.
     * @param {string} typeIndexFileName - The name of the type index file.
     * @return {string} The URL for the type index file.
     * @internal
     */
    public static getTypeIndexURL(session: Session, typeIndexFileName: string): string {
        return `${session.info.webId?.split("/profile")[0]}/settings/${typeIndexFileName}.ttl`;
    }
}