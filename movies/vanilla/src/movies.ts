export type Listing = {
  created: Date;
  modified: Date;
  movie: {
    published: Date;
    description: string;
    image: string;
    name: string;
    sameAs: string[];
  }
}
export type WatchAction = {
  created: Date;
  startTime: Date;
  endTime: Date;
  listing: Listing;
}

export type Interpretation = {
  listings: Listing[];
  watchActions: WatchAction[];
}

async function getJsonLd(uri: string,
  authenticatedFetcher: typeof globalThis.fetch): Promise<object[]> {
  const res = await authenticatedFetcher(uri, {
    headers: {
      Accept: 'application/ld+json',
    },
  });
  return res.json();
}

export async function fetchList(
  folderUri: string,
  aFetch: typeof globalThis.fetch,
): Promise<Interpretation> {
  const index = await getJsonLd(folderUri, aFetch);
  const ret = {
    listings: [],
    watchActions: [],
  };

  await Promise.all(index.map(async (entry: object) => {
    if (entry['@id'] === folderUri) {
      return;
    }
    const listing = await getJsonLd(entry['@id'], aFetch);
    ret.listings.push(listing);
  }));
  return ret;
}
