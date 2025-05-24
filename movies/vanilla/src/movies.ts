import { getJsonLdDateField, getJsonLdLinkField, getJsonLdStringField } from './jsonld.js';

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
  listingUr: string;
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
    listing.forEach(thing => {
      if (thing['@type'].indexOf('https://schema.org/Movie') !== -1) {
        ret.listings.push({
          created: getJsonLdDateField(thing, 'http://purl.org/dc/terms/created'),
          modified: getJsonLdDateField(thing, 'http://purl.org/dc/terms/modified'),
          movie: {
            published: getJsonLdDateField(thing, 'https://schema.org/datePublished'),
            description: getJsonLdStringField(thing, 'https://schema.org/description'),
            image: getJsonLdStringField(thing, 'https://schema.org/image'), // sic: string instead of link here
            name: getJsonLdStringField(thing, 'https://schema.org/name'),
            sameAs: thing['https://schema.org/sameAs'].map(x => x['@value']) as string[], // sic: string instead of link here
          }
        });
      } else if (thing['@type'].indexOf('https://schema.org/WatchAction') !== -1) {
        ret.watchActions.push({
          created: getJsonLdDateField(thing, 'http://purl.org/dc/terms/created'),
          startTime: getJsonLdDateField(thing, 'https://schema.org/startTime'),
          endTime: getJsonLdDateField(thing, 'https://schema.org/endTime'),
          listingId: getJsonLdLinkField(thing, 'https://schema.org/object'),
        });
      } else {
        console.log('thing type not recognised', thing);
      }
    })
  }));
  return ret;
}
