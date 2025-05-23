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

export async function fetchList(
  folderUri: string,
  authenticatedFetcher: typeof globalThis.fetch,
): Promise<Interpretation> {
  const indexRet = await authenticatedFetcher(folderUri, {
    headers: {
      Accept: 'application/ld+json',
    },
  });
  const index = await indexRet.json();
  console.log(index);
  return {
    listings: [],
    watchActions: [],
  };
}
