type NonError<T> = T extends { isError: true } ? never : T;

export function throwIfErr<Results extends { isError: boolean }>(
  result: Results
): NonError<Results> {
  if (result.isError) throw result;
  return result as NonError<Results>;
}

export function throwIfErrOrAbsent<
  Results extends { isError: boolean, type: string, resource: any }
>(
  result: Results
): NonError<Results> {
  const toReturn = throwIfErr(result);
  if (result.type === "absentReadSuccess") {
    throw new Error(`Resource ${result.resource.uri} is absent.`);
  }
  return toReturn;
}

export function getResource<
  Results extends { isError: true } | { isError: false, resource: any }
>(
  result: Results
): NonError<Results>["resource"] {
  const nonErrors = throwIfErr(result);
  return nonErrors.resource;
}