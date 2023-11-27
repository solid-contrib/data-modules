import {
    getNamedNode,
    getSolidDataset,
    getThing
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { getThingAll } from "@inrupt/solid-client";
import {
    BOOKMARK
} from "@inrupt/vocab-common-rdf";
import { __FOR_CLASS, __PRIVATE_TYPEINDEX, __PUBLIC_TYPEINDEX, __SOLID_INSTANCE, __SOLID_INSTANCE_CONTAINER } from "../constants";

export class TypeIndexHelper {
    constructor() { }

    public static async getProfile(session: Session) {
        if (!session.info.webId) return
        const profileDS = await getSolidDataset(session.info.webId, { fetch: session.fetch })

        const me = getThing(profileDS, session.info.webId);

        return me
    }

    public static async getTypeIndex({ session, isPrivate }: { session: Session, isPrivate: boolean }) {

        const me = await this.getProfile(session)

        if (me) {
            // TODO: me doc exists
            const typeIndex = getNamedNode(me, isPrivate ? __PRIVATE_TYPEINDEX : __PUBLIC_TYPEINDEX)

            return typeIndex
        } else {
            // TODO: me doc does not exists
            // consider adding one
            // - create me thing
            // - add typeindex into it if it exists
            // - add instance to typeindex
        }
    }

    public static async getFromTypeIndex(session: Session) {
        const typeIndex = await this.getTypeIndex({ session, isPrivate: true })
        
        if (!typeIndex) return // TODO validate

        const ds = await getSolidDataset(typeIndex?.value, { fetch: session.fetch })

        const all = getThingAll(ds);

        const instances: string[] = []
        const instanceContainers: string[] = []

        all.forEach(x => {
            const forClass = getNamedNode(x, __FOR_CLASS)

            if (forClass?.value === BOOKMARK.Bookmark) {

                const instance = getNamedNode(x, __SOLID_INSTANCE)?.value
                const instanceContainer = getNamedNode(x, __SOLID_INSTANCE_CONTAINER)?.value

                instance && instances?.push(instance)
                instanceContainer && instanceContainers?.push(instanceContainer)
            }
        })

        const bookmarkRegisteries = {
            instances,
            instanceContainers
        }

        return bookmarkRegisteries
    }
}