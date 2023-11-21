import {
  createSolidDocument,
  fetchSolidDocument,
  updateSolidDocument,
} from "@noeldemartin/solid-utils";
import { getEngine } from "soukai";
import {
  Fetch,
  SolidContainer,
  SolidEngine,
  SolidModel,
  SolidTypeRegistration,
} from "soukai-solid";
import { v4 } from "uuid";
import { urlParentDirectory } from "./urlHelpers";

export async function getTypeIndexFromProfile(args: {
  webId: string;
  fetch?: Fetch;
  typePredicate: "solid:publicTypeIndex" | "solid:privateTypeIndex";
}) {
  const profile = await fetchSolidDocument(args.webId, args.fetch);

  const containerQuad = profile
    .statements(undefined, "rdf:type", "http://schema.org/Person")
    .find((statement) =>
      profile.contains(statement.subject.value, args.typePredicate)
    );

  return profile.statement(containerQuad?.subject.value, args.typePredicate)
    ?.object.value;
}

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

  await typeRegistration.withEngine(getEngine()!, () =>
    typeRegistration.save(urlParentDirectory(args.typeIndexUrl) ?? "")
  );
};

export async function createTypeIndex(
  webId: string,
  type: "public" | "private",
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
