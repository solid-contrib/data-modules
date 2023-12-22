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

/**
 * Fetches the public or private type index URL from a profile document.
 *
 * @param args - Arguments object with webId, fetch, and typePredicate
 * @returns The URL of the type index for the given predicate
 */
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

/**
 * Registers a given instance container in the provided type index.
 *
 * @param args - Arguments object containing:
 * - instanceContainer: The URL of the instance container to register
 * - forClass: The class name that this instance container contains
 * - typeIndexUrl: The URL of the type index to register in
 */
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

/**
 * Creates a public or private type index for the given WebID.
 *
 * @param webId - The WebID to create the type index for
 * @param type - Either "public" or "private"
 * @param fetch - Optional fetch function
 * @returns The URL of the created type index
 */
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

/**
 * Finds registrations of a given type and predicate in a type index.
 *
 * @param typeIndexUrl - The URL of the type index
 * @param type - The type or types to find registrations for
 * @param predicate - The predicate to find registrations of
 * @param fetch - Optional fetch function
 * @returns Promise resolving to an array of registration URLs
 */
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

/**
 * Finds container registrations for a type in a type index.
 *
 * @param typeIndexUrl - The URL of the type index
 * @param type - The type or types to find container registrations for
 * @param fetch - Optional fetch function
 * @returns Promise resolving to an array of container registration URLs
 */
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

/**
 * Finds instance registrations for a type in a type index.
 *
 * @param typeIndexUrl - The URL of the type index
 * @param type - The type or types to find instance registrations for
 * @param fetch - Optional fetch function
 * @returns Promise resolving to an array of instance registration URLs
 */
export async function findInstanceRegistrations(
  typeIndexUrl: string,
  type: string | string[],
  fetch?: Fetch
): Promise<string[]> {
  return findRegistrations(typeIndexUrl, type, "solid:instance", fetch);
}

/**
 * Retrieves Solid containers and instances of a given model class from a type index.
 *
 * Fetches container and instance registrations from the type index for the
 * provided model class's RDF types. Creates SolidContainer instances for the
 * found URLs and returns them.
 *
 * @param typeIndexUrl - URL of the type index to search
 * @param childrenModelClass - The Solid model class to find containers/instances of
 * @returns Promise resolving to an array of SolidContainer instances
 */
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
