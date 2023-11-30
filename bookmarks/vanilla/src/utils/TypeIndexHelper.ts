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

export class TypeIndexHelper {

    /**
     * Retrieves the profile of the user associated with the given session.
     *
     * @param {Session} session - The session object containing the user's information.
     * @return {Promise<Thing | undefined>} The user's profile or undefined if the profile does not exist.
     */
    private static async getMeProfile(session: Session) {
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
     * Retrieves the type index from the session for the given isPrivate flag.
     *
     * @param {Session} session - the session object
     * @param {boolean} isPrivate - flag indicating if the type index is private
     * @return {Promise<Node>} - the type index node
     */
    private static async getTypeIndex(session: Session, isPrivate: boolean) {
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
     * @param session - The session object.
     * @param me - The persisted thing.
     * @param isPrivate - Indicates whether the type index should be private.
     * @returns A promise that resolves when the type index has been added.
     */
    private static async addTypeIndexToProfile(session: Session, me: ThingPersisted, isPrivate: boolean) {
        const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);
        const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);
        const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

        await this.createTypeIndex(session, typeIndexUrl);

        const updatedMe = addNamedNode(me, typeIndexPredicate, namedNode(typeIndexUrl));

        try {
            const ds = await getSolidDataset(typeIndexUrl, { fetch: session.fetch });
            const updated = setThing(ds, updatedMe);
            await saveSolidDatasetAt(typeIndexUrl, updated, { fetch: session.fetch });
        } catch (error) {
            console.error(`Failed to add type index to profile: ${error}`);
            throw error;
        }
    }

    /**
     * Retrieves a list of instances from the type index.
     *
     * @param {Session} session - The session object.
     * @param {boolean} isPrivate - A boolean indicating whether the instances are private.
     * @return {Promise<string[]>} A promise that resolves to an array of instance URLs.
     */
    public static async getFromTypeIndex(session: Session, isPrivate: true) {
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
     * @param {boolean} isPrivate - Indicates whether the type index is private.
     * @return {Promise<void>} - A promise that resolves when the registration is complete.
     */
    public static async registerInTypeIndex(session: Session, indexUrl: string, isPrivate: boolean) {
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
    }


    /**
     * Create a type index using the given session and type index URL.
     *
     * @param {Session} session - The session object.
     * @param {string} typeIndexUrl - The URL of the type index.
     * @return {Promise<void>} - A promise that resolves when the type index is created successfully.
     */
    private static async createTypeIndex(session: Session, typeIndexUrl: string) {

        try {
            await session.fetch(typeIndexUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "text/turtle",
                },
                body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.\n\n<> a solid:TypeIndex, solid:UnlistedDocument.`
            })
        } catch (error) {
            console.error(error)
        }

        // const ds = createSolidDataset();

        // const thing = buildThing(createThing())
        //     .addUrl(RDF.type, namedNode(__solidUnlistedDocument))
        //     .addUrl(RDF.type, namedNode(__solidTypeIndex))
        //     .build();

        // const updatedDS = setThing(ds, thing);

        // await saveSolidDatasetAt(typeIndexUrl, updatedDS, { fetch: session.fetch });
    }

    /**
     * Returns the file name of the type index based on the privacy of the type.
     *
     * @param {boolean} isPrivate - Indicates whether the type is private or not.
     * @return {string} The file name of the type index.
     */
    private static getTypeIndexFileName(isPrivate: boolean) {
        return isPrivate ? "privateTypeIndex" : "publicTypeIndex";
    }

    /**
     * Returns the type index predicate based on the value of isPrivate.
     *
     * @param {boolean} isPrivate - Specifies whether the type index predicate should be private or public.
     * @return {Function} - The type index predicate function.
     */
    private static getTypeIndexPredicate(isPrivate: boolean) {
        return isPrivate ? __privateTypeIndex : __publicTypeIndex;
    }

    /**
     * Retrieves the URL of the type index file for a given session and type index filename.
     *
     * @param {Session} session - The session object.
     * @param {string} typeIndexFileName - The name of the type index file.
     * @return {string} The URL of the type index file.
     */
    private static getTypeIndexURL(session: Session, typeIndexFileName: string) {
        return `${session.info.webId?.split("/profile")[0]}/settings/${typeIndexFileName}.ttl`;
    }
}