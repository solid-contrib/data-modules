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
