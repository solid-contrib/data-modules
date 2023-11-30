import {
    ThingPersisted,
    addNamedNode,
    buildThing,
    createSolidDataset,
    createThing,
    getNamedNode,
    getSolidDataset,
    getThing,
    getUrl,
    saveSolidDatasetAt,
    setThing
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { getThingAll } from "@inrupt/solid-client";
import {
    BOOKMARK, RDF,
} from "@inrupt/vocab-common-rdf";
import { __Bookmark, __foafPerson, __forClass, __privateTypeIndex, __publicTypeIndex, __schemaPerson, __solid_instance, __solid_instance_container, __solidTypeIndex, __solidTypeRegistration, __solidUnlistedDocument } from "../constants";
import { namedNode } from '@rdfjs/data-model';

export class TypeIndexHelper {
    constructor() { }

    private static async getProfile(session: Session) {
        if (!session.info.webId) return
        const profileDS = await getSolidDataset(session.info.webId, { fetch: session.fetch })

        const me = getThing(profileDS, session.info.webId);

        return me
    }

    private static async getTypeIndex({ session, isPrivate }: { session: Session, isPrivate: boolean }) {
        const me = await this.getProfile(session)

        if (me) {
            const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);

            const typeIndex = getNamedNode(me, typeIndexPredicate)

            if (typeIndex) {
                return typeIndex
            } else {
                await TypeIndexHelper.addTypeIndexToProfile(session, me, isPrivate);

                const _me = await this.getProfile(session) // maybe this is not needed, me already updated, need to check

                const typeIndex = getNamedNode(_me!, typeIndexPredicate)

                return typeIndex
            }

        } else {

            const profileDS = await getSolidDataset(session.info.webId!, { fetch: session.fetch })

            const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);
            const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);
            const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

            await this.createTypeIndex(session, typeIndexUrl);

            const meThing = buildThing(createThing({ name: "me" }))
                .addNamedNode(typeIndexPredicate, namedNode(typeIndexUrl))
                .addUrl(RDF.type, __foafPerson)
                .addUrl(RDF.type, __schemaPerson)
                .build();

            const updated = setThing(profileDS, meThing);

            await saveSolidDatasetAt(session.info.webId!, updated, { fetch: session.fetch });

            // const _me = await this.getProfile(session) // maybe this is not needed, me already updated, need to check

            const typeIndex = getNamedNode(meThing, typeIndexPredicate)

            return typeIndex
        }
    }

    private static getTypeIndexPredicate(isPrivate: boolean) {
        return isPrivate ? __privateTypeIndex : __publicTypeIndex;
    }

    private static async addTypeIndexToProfile(session: Session, me: ThingPersisted, isPrivate: boolean) {
        const typeIndexPredicate = TypeIndexHelper.getTypeIndexPredicate(isPrivate);

        const typeIndexFileName = TypeIndexHelper.getTypeIndexFileName(isPrivate);

        const typeIndexUrl = TypeIndexHelper.getTypeIndexURL(session, typeIndexFileName);

        await this.createTypeIndex(session, typeIndexUrl);

        const updatedMe = addNamedNode(me, typeIndexPredicate, namedNode(typeIndexUrl));

        const ds = await getSolidDataset(typeIndexUrl, { fetch: session.fetch });

        const updated = setThing(ds, updatedMe);

        await saveSolidDatasetAt(typeIndexUrl, updated, { fetch: session.fetch });
    }

    private static getTypeIndexFileName(isPrivate: boolean) {
        return isPrivate ? "privateTypeIndex" : "publicTypeIndex";
    }

    private static getTypeIndexURL(session: Session, typeIndexFileName: string) {
        return `${session.info.webId?.split("/profile")[0]}/settings/${typeIndexFileName}.ttl`;
    }

    public static async getFromTypeIndex(session: Session, isPrivate: true) {
        const typeIndex = await this.getTypeIndex({ session, isPrivate })

        if (!typeIndex) return [];

        const ds = await getSolidDataset(typeIndex?.value, { fetch: session.fetch })

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


        // if (!responce.length) {
        //     await this.registerInTypeIndex(session, defaultIndexUrl, true)

        //     return [defaultIndexUrl]
        // }

        return responce
    }

    public static async registerInTypeIndex(session: Session, indexUrl: string, isPrivate: boolean) {
        const typeIndex = await this.getTypeIndex({ session, isPrivate })

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
}