import {
    SolidDataset,
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
     * Retrieves the user's profile from a Solid dataset using the provided session information.
     *
     * @param {Session} session - The session object containing the necessary information to access the dataset.
     * @throws {Error} Throws an error if the session does not contain a web ID.
     * @return {Promise<ThingPersisted | null>} The user's profile as a Thing object, or null if the profile does not exist.
     */
    public static async getMeProfile(session: Session): Promise<ThingPersisted | null> {
        if (!session.info.webId) throw new Error("Missing WebID");

        const profileDS = await getSolidDataset(session.info.webId, { fetch: session.fetch });

        let profileMe = getThing(profileDS, session.info.webId);

        if (!profileMe) {
            const profileMeThing = buildThing(createThing({ name: "me" }))
                .addUrl(RDF.type, __foafPerson)
                .addUrl(RDF.type, __schemaPerson)
                .build();

            const updatedProfile = setThing(profileDS, profileMeThing);

            const updatedProfileDS = await saveSolidDatasetAt(session.info.webId!, updatedProfile, { fetch: session.fetch });

            profileMe = getThing(updatedProfileDS, session.info.webId);

        }

        return profileMe;
    }

    /**
     * Retrieves the typeIndex for a given session and isPrivate flag.
     *
     * @param {Session} session - The session object.
     * @param {boolean} isPrivate - A flag indicating whether the typeIndex is private.
     * @return {Promise<NamedNode<string>>} A promise that resolves to the named node representing the typeIndex.
     */
    public static async getTypeIndex(session: Session, isPrivate: boolean): Promise<NamedNode<string>> {
        const profileMe = await this.getMeProfile(session)

        const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);
        const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);
        const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

        if (profileMe) {
            let typeIndex = getNamedNode(profileMe, typeIndexPredicate)

            if (typeIndex) return typeIndex;

            const typeIndexDS = await this.createTypeIndex(session, typeIndexUrl);

            const updatedProfileMe = addNamedNode(profileMe, typeIndexPredicate, namedNode(typeIndexUrl));

            const updatedTypeIndexDS = setThing(typeIndexDS!, updatedProfileMe);

            await saveSolidDatasetAt(typeIndexUrl, updatedTypeIndexDS, { fetch: session.fetch });

            return namedNode(typeIndexUrl)
        } else {
            const typeIndexDS = await this.createTypeIndex(session, typeIndexUrl);
            const profileDS = await getSolidDataset(session.info.webId!, { fetch: session.fetch });

            const profileMeThing = buildThing(createThing({ name: "me" }))
                .addNamedNode(typeIndexPredicate, namedNode(typeIndexUrl))
                .addUrl(RDF.type, __foafPerson)
                .addUrl(RDF.type, __schemaPerson)
                .build();

            const updatedProfileDS = setThing(profileDS, profileMeThing);

            await saveSolidDatasetAt(session.info.webId!, updatedProfileDS, { fetch: session.fetch });

            return namedNode(typeIndexUrl)
        }
    }


    /**
     * Retrieves an array of strings representing instances from the typeIndex.
     *
     * @param {Session} session - The session object.
     * @param {boolean} isPrivate - A boolean indicating if the instances are private.
     * @return {Promise<string[]>} A promise that resolves to an array of strings representing instances.
     */
    public static async getFromTypeIndex(session: Session, isPrivate: true): Promise<string[]> {
        const typeIndex = await this.getTypeIndex(session, isPrivate);

        const typeIndexDS = await getSolidDataset(typeIndex?.value, { fetch: session.fetch });

        const allRegisteries = getThingAll(typeIndexDS);

        const instances: string[] = []
        const instanceContainers: string[] = []


        allRegisteries.forEach(registery => {
            const forClass = getNamedNode(registery, __forClass)

            if (forClass?.value === BOOKMARK.Bookmark) {

                const instance = getNamedNode(registery, __solid_instance)?.value
                const instanceContainer = getNamedNode(registery, __solid_instance_container)?.value

                instance && instances?.push(instance)
                instanceContainer && instanceContainers?.push(instanceContainer)
            }
        })

        const instanceContainersPromises = instanceContainers.map(async (instanceContainer) => {

            const instanceContainerDS = await getSolidDataset(instanceContainer, { fetch: session.fetch })

            const all = getThingAll(instanceContainerDS); // all files under the instanceContainer

            const urls = all.map(x => x.url) // all file urls

            return urls.filter(url => url !== instanceContainer) // remove the instanceContainer itself, only file urls needed;
        })

        const innerInstances = (await Promise.all([...instanceContainersPromises])).flat();

        return [...new Set([...instances, ...innerInstances])]
    }

    /**
     * Registers the indexUrl in the typeIndex.
     *
     * @param {Session} session - The session object.
     * @param {string} indexUrl - The URL of the typeIndex.
     * @param {boolean} isPrivate - Indicates whether the typeIndex is private.
     * @return {Promise<SolidDataset>} A promise that resolves to the updated typeIndex.
     */
    public static async registerInTypeIndex(session: Session, indexUrl: string, isPrivate: boolean): Promise<SolidDataset> {
        const typeIndex = await this.getTypeIndex(session, isPrivate);

        const typeIndexDS = await getSolidDataset(typeIndex?.value, { fetch: session.fetch });

        const bookmarksRegistery = buildThing(createThing({ name: "bookmarks_registery" }))
            .addNamedNode(__forClass, namedNode(__Bookmark))
            .addNamedNode(__solid_instance, namedNode(indexUrl))
            .addUrl(RDF.type, __solidTypeRegistration)
            .build();

        const updatedTypeIndexDS = setThing(typeIndexDS, bookmarksRegistery);

        return await saveSolidDatasetAt(typeIndex?.value, updatedTypeIndexDS, { fetch: session.fetch });
    }

    /**
     * Creates a typeIndex using the provided session and typeIndex URL.
     *
     * @param {Session} session - The session used for making the request.
     * @param {string} typeIndexUrl - The URL of the typeIndex to create.
     * @return {Promise<SolidDataset | undefined>} A promise that resolves to the created typeIndex.
     */
    public static async createTypeIndex(session: Session, typeIndexUrl: string): Promise<SolidDataset | undefined> {
        try {
            await session.fetch(typeIndexUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "text/turtle",
                },
                body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.\n\n<> a solid:TypeIndex, solid:UnlistedDocument.`
            })

            return await getSolidDataset(typeIndexUrl, { fetch: session.fetch })
        } catch (error) {

        }
    }

    /**
     * Returns the name of the typeIndex file based on the value of the isPrivate parameter.
     *
     * @param {boolean} isPrivate - A boolean indicating whether the typeIndex file is private or not.
     * @return {"privateTypeIndex" | "publicTypeIndex"} The name of the typeIndex file.
     */
    public static getTypeIndexFileName(isPrivate: boolean): "privateTypeIndex" | "publicTypeIndex" {
        return isPrivate ? "privateTypeIndex" : "publicTypeIndex";
    }

    /**
     * Returns the typeIndex predicate based on whether the given flag is private or not.
     *
     * @param {boolean} isPrivate - A flag indicating whether the typeIndex predicate should be private or public.
     * @return {type} - The typeIndex predicate.
     */
    public static getTypeIndexPredicate(isPrivate: boolean): string {
        return isPrivate ? __privateTypeIndex : __publicTypeIndex;
    }

    /**
     * Generates the URL for the typeIndex file based on the session and typeIndex file name.
     *
     * @param {Session} session - The session object.
     * @param {string} typeIndexFileName - The name of the typeIndex file.
     * @return {string} The URL for the typeIndex file.
     */
    public static getTypeIndexURL(session: Session, typeIndexFileName: string): string {
        return `${session.info.webId?.split("/profile")[0]}/settings/${typeIndexFileName}.ttl`;
    }
}