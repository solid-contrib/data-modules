import { addStringNoLocale, addUrl, createSolidDataset, createThing, getPodUrlAll, getSolidDataset, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { BOOKMARK, DCTERMS, RDF } from "@inrupt/vocab-common-rdf";

export async function getUserPodUrls(session: Session) {
  return await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
}

export const getOrCreateBookmarks = async (session: Session) => {
  const indexUrl = await getBookmarksIndexUrl(session);
  try {
    const list = await getSolidDataset(indexUrl, { fetch: session.fetch });
    return list;
  } catch (error: any) {
    if (error.statusCode === 404) {
      const list = saveSolidDatasetAt(indexUrl, createSolidDataset(), { fetch: session.fetch });
      return list;
    }
  }
};


export const getBookmarksIndexUrl = async (session: Session) => {
  const pods = await getUserPodUrls(session); // ['https://soltanireza65.solidcommunity.net/']
  const bookmarksContainerUri = `${pods[0]}bookmarks/`;
  return `${bookmarksContainerUri}index.ttl`;
};

export const createBookmark = async (title: string, link: string, session: Session) => {
  const bookmarksIndexUrl = await getBookmarksIndexUrl(session);
  const bookmarksDataset = await getSolidDataset(bookmarksIndexUrl, { fetch: session.fetch });

  const bookmarkWithTitle = addStringNoLocale(createThing(), DCTERMS.title, title);
  const bookmarkWithLink = addStringNoLocale(bookmarkWithTitle, BOOKMARK.recalls, link);

  const bookmarkWithType = addUrl(bookmarkWithLink, RDF.type, BOOKMARK.Bookmark);

  const updatedBookmarkList = setThing(bookmarksDataset, bookmarkWithType);
  const updatedDataset = await saveSolidDatasetAt(bookmarksIndexUrl, updatedBookmarkList, { fetch: session.fetch });
  return updatedDataset
};