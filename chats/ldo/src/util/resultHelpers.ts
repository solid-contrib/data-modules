type NonError<T> = T extends { isError: true } ? never : T;

export function throwIfErr<Results extends { isError: boolean }>(
  result: Results
): NonError<Results> {
  if (result.isError) throw result;
  return result as NonError<Results>;
}

export function getResource<
  Results extends { isError: true } | { isError: false, resource: any }
>(
  result: Results
): NonError<Results>["resource"] {
  const nonErrors = throwIfErr(result);
  return nonErrors.resource;
}