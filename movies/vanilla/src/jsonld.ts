export function getJsonLdFields(
  entry: object,
  pred: string,
  subPred: string,
): string[] {
  if (Array.isArray(entry[pred])) {
    return entry[pred].map(obj => obj[subPred]);
  }
  return [];
}

export function getJsonLdField(
  entry: object,
  pred: string,
  subPred: string,
): string | undefined {
  const results = getJsonLdFields(entry, pred, subPred);
  if (results.length === 1) {
    return results[0];
  }
  return undefined;
}

export function getJsonLdId(entry: object): string | undefined {
  return entry['@id'];
}

export function getJsonLdType(entry: object): string | undefined {
  const types = entry['@type'];
  if (Array.isArray(types)) {
    return types[0];
  }
  return undefined;
}

export function getJsonLdFieldMulti(
  entry: object,
  pred: string,
  subPred: string,
): string[] | undefined {
  if (Array.isArray(entry[pred]) && entry[pred].length === 1) {
    return entry[pred].map((obj) => obj[subPred]);
  }
  return undefined;
}

export function getJsonLdLinkField(
  entry: object,
  pred: string,
): string | undefined {
  return getJsonLdField(entry, pred, '@id');
}

export function getJsonLdStringField(
  entry: object,
  pred: string,
): string | undefined {
  return getJsonLdField(entry, pred, '@value');
}

// use this function to deal with cases where
// links might be incorrectly stored as strings
export function getJsonLdLinkOrStringField(
  entry: object,
  pred: string,
): string | undefined {
  let ret = getJsonLdLinkField(entry, pred);
  if (typeof ret === 'undefined') {
    ret = getJsonLdStringField(entry, pred);
  }
  return ret;
}

export function getJsonLdStringFieldMulti(
  entry: object,
  pred: string,
): string[] | undefined {
  return getJsonLdFieldMulti(entry, pred, '@id');
}

export function getJsonLdDateField(
  entry: object,
  pred: string,
): Date | undefined {
  const typeStr = getJsonLdField(entry, pred, '@type');
  if (typeStr === 'http://www.w3.org/2001/XMLSchema#dateTime') {
    const valueStr = getJsonLdStringField(entry, pred);
    if (typeof valueStr === 'string') {
      return new Date(valueStr);
    }
  }
  return undefined;
}
