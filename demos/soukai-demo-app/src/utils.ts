import {
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { Bookmark } from "soukai-solid-bookmarks";
import { bootModels, getEngine, setEngine } from "soukai";
import {
  Fetch,
  SolidContainer,
  SolidEngine,
  SolidModel,
  SolidTypeIndex,
  SolidTypeRegistration,
  bootSolidModels,
} from "soukai-solid";

import {
  createSolidDocument,
  fetchSolidDocument,
  updateSolidDocument,
} from "@noeldemartin/solid-utils";
import { v4 } from "uuid";
import { BookmarkModel, TopicModel } from "./components/Bookmarks";

export async function doLogin() {
  await login({
    clientName: "solid-soukai-app",
    oidcIssuer: "https://solidcommunity.net",
    redirectUrl: window.location.href,
  });
}

export function doLogout() {
  logout();
  // .then(() => {
  //     // location.reload()
  // })
  window.location.reload();
}

export async function handleRedirectAfterLogin(
  cb: (loggedInSession: Session) => void
) {
  await handleIncomingRedirect({ restorePreviousSession: true }); // no-op if not part of login redirect

  const session = getDefaultSession();
  
  if (session.info.isLoggedIn) {
    cb(session); // setUserSession(session)
    // setEngine(new SolidEngine(session.fetch));
    window.fetch = session.fetch;
  }
}

export function bootSoukai(fetch?: Fetch) {
  bootSolidModels();
  bootModels({
    Bookmark: Bookmark,
    BookmarkModel: BookmarkModel,
    TopicModel: TopicModel,
    TypeIndex: SolidTypeIndex,
    SolidTypeIndex: SolidTypeIndex,
  });
  setEngine(new SolidEngine(fetch));
}

type FetchContainrURLArgs = {
  typeIndexUrl?: string;
  forClass: string;
  fetch?: Fetch;
  baseURL: string;
  webId: string;
};

export async function getTypeIndexFromPofile({
  webId,
  fetch,
  typePredicate,
}: {
  webId: string;
  fetch?: Fetch;
  typePredicate: "solid:publicTypeIndex" | "solid:privateTypeIndex";
}) {
  const profile = await fetchSolidDocument(webId, fetch);

  const containerQuad = profile
    .statements(undefined, "rdf:type", "http://schema.org/Person")
    .find((statement) =>
      profile.contains(statement.subject.value, typePredicate)
    );

  return profile.statement(containerQuad?.subject.value, typePredicate)?.object
    .value;

  // return containerQuad
  //     ?
  //     profile.statement(containerQuad.subject.value, typePredicate)?.object.value ?? null
  //     :
  //     null;
}

export const fetchContainerUrl = async (args: FetchContainrURLArgs) => {
  try {
    const typeIndexUrl = args.typeIndexUrl!; // ?? await createPrivateTypeIndex(args.baseURL, args.webId, `${args.baseURL}profile/card`, fetch);

    // const containerUrl = (
    //     await SolidContainer.fromTypeIndex(args.typeIndexUrl!, Bookmark)
    // );

    const document = await fetchSolidDocument(typeIndexUrl, args.fetch);

    const containerType = document
      .statements(undefined, "rdf:type", "solid:TypeRegistration")
      .find(
        (statement) =>
          document.contains(
            statement.subject.value,
            "solid:forClass",
            args.forClass
          ) &&
          document.contains(statement.subject.value, "solid:instanceContainer")
      );
    return containerType
      ? document.statement(
          containerType.subject.value,
          "solid:instanceContainer"
        )?.object.value ?? null
      : null;
  } catch (error) {
    return null;
  }
};

// // export const findOrCreateTasksContainer = async (session: any): Promise<SolidContainer> => {
// export const findOrCreateTasksContainer = async (session: any) => {
//   // const name = 'Bookmarks';
//   // const url = "https://reza-soltani.solidcommunity.net/bookmarks";
//   // const typeIndex = await Solid.findOrCreatePrivateTypeIndex();
//   // const typeIndexUrl = "https://reza-soltani.solidcommunity.net/settings/privateTypeIndex.ttl";
//   // const containers = await SolidContainer.withEngine(getEngine()).fromTypeIndex(typeIndexUrl, Bookmark);
//   // return (
//   //     containers.find((container) => container.url === url)
//   //     ??
//   //     (await Solid.createPrivateContainer({ url, name, registerFor: SolidTask, reuseExisting: true }))
//   // );
// };

export const registerInTypeIndex = async (args: {
  instanceContainer: string;
  forClass: string;
  typeIndexUrl: string;
}) => {
  const typeRegistration = new SolidTypeRegistration({
    forClass: args.forClass,
    instanceContainer: args.instanceContainer,
  });

  typeRegistration.mintUrl(args.typeIndexUrl, true, v4());

  return await typeRegistration.withEngine(getEngine()!, async () => {
    await typeRegistration.save(urlParentDirectory(args.typeIndexUrl) ?? "");
  });
};

export function urlRoot(url: string): string {
  const protocolIndex = url.indexOf("://") + 3;
  const pathIndex = url.substring(protocolIndex).indexOf("/");

  return pathIndex !== -1 ? url.substring(0, protocolIndex + pathIndex) : url;
}

export function urlParentDirectory(url: string): string | null {
  if (url.endsWith("/")) url = url.substring(0, url.length - 1);

  if (urlRoot(url) === url) return null;

  const pathIndex = url.lastIndexOf("/");

  return pathIndex !== -1 ? url.substring(0, pathIndex + 1) : null;
}

// const foo = <T extends unknown>(x: T) => x;
type TypeIndexType = "public" | "private";

// async function mintTypeIndexUrl(baseURL: string, type: TypeIndexType, fetch?: Fetch): Promise<string> {
//     fetch = fetch ?? window.fetch.bind(fetch);

//     const typeIndexUrl = `${baseURL}settings/${type}TypeIndex.ttl`;

//     return await solidDocumentExists(typeIndexUrl, fetch)
//         ? `${baseURL}settings/${type}TypeIndex.ttl`
//         : typeIndexUrl;
// }

export async function createTypeIndex(
  webId: string,
  type: TypeIndexType,
  fetch?: Fetch
) {
  const baseURL = webId.split("profile")[0];

  // fetch = fetch ?? window.fetch.bind(fetch);

  // const typeIndexUrl = await mintTypeIndexUrl(baseURL, type, fetch);
  const typeIndexUrl = `${baseURL}settings/${type}TypeIndex.ttl`;

  const typeIndexBody =
    type === "public"
      ? "<> a <http://www.w3.org/ns/solid/terms#TypeIndex> ."
      : `
            <> a
                <http://www.w3.org/ns/solid/terms#TypeIndex>,
                <http://www.w3.org/ns/solid/terms#UnlistedDocument> .
        `;
  const profileUpdateBody = `
        INSERT DATA {
            <${webId}> <http://www.w3.org/ns/solid/terms#${type}TypeIndex> <${typeIndexUrl}> .
        }
    `;

  await Promise.all([
    createSolidDocument(typeIndexUrl, typeIndexBody, fetch),
    updateSolidDocument(webId, profileUpdateBody, fetch), // https://reza-soltani.solidcommunity.net/profile/card
  ]);

  if (type === "public") {
    // TODO Implement updating ACLs for the listing itself to public
  }

  return typeIndexUrl;
}

// export async function createPublicTypeIndex(baseURL: string, webId: string, writableProfileUrl: string, fetch?: Fetch): Promise<string> {
//     return createTypeIndex(baseURL, webId, writableProfileUrl, 'public', fetch);
// }

// export async function createPrivateTypeIndex(baseURL: string, webId: string, writableProfileUrl: string, fetch?: Fetch): Promise<string> {
//     return createTypeIndex(baseURL, webId, writableProfileUrl, 'private', fetch);
// }

async function findRegistrations(
  typeIndexUrl: string,
  type: string | string[],
  predicate: string,
  fetch?: Fetch
): Promise<string[]> {
  const typeIndex = await fetchSolidDocument(typeIndexUrl, fetch);
  const types = Array.isArray(type) ? type : [type];

  return types
    .map((type) =>
      typeIndex
        .statements(undefined, "rdf:type", "solid:TypeRegistration")
        .filter((statement) =>
          typeIndex.contains(statement.subject.value, "solid:forClass", type)
        )
        .map((statement) =>
          typeIndex.statements(statement.subject.value, predicate)
        )
        .flat()
        .map((statement) => statement.object.value)
        .filter((url) => !!url)
    )
    .flat();
}

export async function findContainerRegistrations(
  typeIndexUrl: string,
  type: string | string[],
  fetch?: Fetch
): Promise<string[]> {
  return findRegistrations(
    typeIndexUrl,
    type,
    "solid:instanceContainer",
    fetch
  );
}

export async function findInstanceRegistrations(
  typeIndexUrl: string,
  type: string | string[],
  fetch?: Fetch
): Promise<string[]> {
  return findRegistrations(typeIndexUrl, type, "solid:instance", fetch);
}

// =====================

// type FetchContainrURLArgs = {
//     typeIndexUrl?: string;
//     forClass: string,
//     fetch?: any
//     baseURL: string,
//     webId: string,
// }

// export const fetchContainerUrl = async (args: FetchContainrURLArgs) => {
//     try {
//         const typeIndexUrl = args.typeIndexUrl ?? await createPrivateTypeIndex(args.baseURL, args.webId, `${args.baseURL}profile/card`, fetch);

//         const document = await fetchSolidDocument(typeIndexUrl, args.fetch);
//         const containerType = document.statements(undefined, "rdf:type", "solid:TypeRegistration")
//             .find((statement) =>
//                 document.contains(statement.subject.value, "solid:forClass", args.forClass)
//                 &&
//                 document.contains(statement.subject.value, "solid:instanceContainer")
//             );
//         return containerType ? document.statement(containerType.subject.value, "solid:instanceContainer")?.object.value ?? null : null;
//     } catch (error) {
//         return null;
//     }
// };

// async function mintTypeIndexUrl(baseURL: string, type: TypeIndexType, fetch?: Fetch): Promise<string> {
//     fetch = fetch ?? window.fetch.bind(fetch);

//     const typeIndexUrl = `${baseURL}settings/${type}TypeIndex.ttl`;

//     return await solidDocumentExists(typeIndexUrl, fetch)
//         ? `${baseURL}settings/${type}TypeIndex.ttl`
//         : typeIndexUrl;
// }

// export async function createTypeIndex(baseURL: string, webId: string, writableProfileUrl: string, type: TypeIndexType, fetch?: Fetch) {
//     if (writableProfileUrl === null) {
//         throw new Error('Can\'t create type index without a writable profile document');
//     }

//     fetch = fetch ?? window.fetch.bind(fetch);

//     const typeIndexUrl = await mintTypeIndexUrl(baseURL, type, fetch);
//     const typeIndexBody = type === 'public'
//         ? '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .'
//         : `
//             <> a
//                 <http://www.w3.org/ns/solid/terms#TypeIndex>,
//                 <http://www.w3.org/ns/solid/terms#UnlistedDocument> .
//         `;
//     const profileUpdateBody = `
//         INSERT DATA {
//             <${webId}> <http://www.w3.org/ns/solid/terms#${type}TypeIndex> <${typeIndexUrl}> .
//         }
//     `;

//     await Promise.all([
//         createSolidDocument(typeIndexUrl, typeIndexBody, fetch),
//         updateSolidDocument(writableProfileUrl, profileUpdateBody, fetch), // https://reza-soltani.solidcommunity.net/profile/card
//     ]);

//     if (type === 'public') {
//         // TODO Implement updating ACLs for the listing itself to public
//     }

//     return typeIndexUrl;
// }

// export async function createPublicTypeIndex(baseURL: string, webId: string, writableProfileUrl: string, fetch?: Fetch): Promise<string> {
//     return createTypeIndex(baseURL, webId, writableProfileUrl, 'public', fetch);
// }

// export async function createPrivateTypeIndex(baseURL: string, webId: string, writableProfileUrl: string, fetch?: Fetch): Promise<string> {
//     return createTypeIndex(baseURL, webId, writableProfileUrl, 'private', fetch);
// }

export const fromTypeIndex = async (
  typeIndexUrl: string,
  childrenModelClass: typeof SolidModel
) => {
  const engine = getEngine();

  const fetch = engine instanceof SolidEngine ? engine.getFetch() : undefined;

  const containerPromise = findContainerRegistrations(
    typeIndexUrl,
    childrenModelClass.rdfsClasses,
    fetch
  );

  const instancePromise = findInstanceRegistrations(
    typeIndexUrl,
    childrenModelClass.rdfsClasses,
    fetch
  );

  const allPromise = Promise.all([containerPromise, instancePromise]);

  try {
    const [containers, instances] = await allPromise;

    const result = [
      ...containers.map((url) => SolidContainer.newInstance({ url }, true)),
      ...instances.map((url) => SolidContainer.newInstance({ url }, true)),
    ];

    return result;
  } catch (error) {
    console.log("🚀 ~ file: utils.ts:389 ~ error:", error);
  }

  // const c_urls = await findContainerRegistrations(typeIndexUrl, childrenModelClass.rdfsClasses, fetch);

  // const i_urls = await findInstanceRegistrations(typeIndexUrl, childrenModelClass.rdfsClasses, fetch);

  // const urls = [...c_urls, ...i_urls]

  // console.log("🚀 ~ file: utils.ts:383 ~ urls:", urls)

  // return urls.map(url => SolidContainer.newInstance({ url }, true));
};
