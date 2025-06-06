import { when } from "jest-when";

/**
 * Mock a turtle document at the given URL
 * @param fetch - A mocked fetch function
 * @param url - The URL to mock
 * @param ttl - The mocked turtle file content
 * @param additionalHeaders - Additional headers to include in the response
 */
export function mockTurtleDocument(
  fetch: jest.Mock,
  url: string,
  ttl: string,
  additionalHeaders: Record<string, string> = {},
) {
  when(fetch)
    .calledWith(url, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
        link: '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "text/n3",
        ...additionalHeaders,
      }),
      text: () => Promise.resolve(ttl),
    } as Response);
}

/**
 * Mock a LDP container at the given URL
 * @param fetch - A mocked fetch function
 * @param url - The URL to mock
 * @param contains - List of URLs of documents contained in this container
 * @param moreTurtle - Additional turtle to include into the response
 * @param additionalHeaders - Additional headers to include in the response
 */
export function mockLdpContainer(
  fetch: jest.Mock,
  url: string,
  contains: string[] = [],
  moreTurtle: string = "",
  additionalHeaders: Record<string, string> = {},
) {
  when(fetch)
    .calledWith(url, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
        link: '<http://www.w3.org/ns/ldp#Container>; rel="type"',
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "text/n3",
        ...additionalHeaders,
      }),
      text: () =>
        Promise.resolve(`
      @prefix dc: <http://purl.org/dc/terms/>.
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      <> a ldp:Container, ldp:BasicContainer, ldp:Resource ;
        ${contains.map((it) => `ldp:contains <${it}>`).join("; ")}
      .
      ${moreTurtle}`),
    } as Response);
}

/**
 * Mock a 404 - Not Found response for the given URL
 * @param fetch - A mocked fetch function
 * @param url - The URL to mock
 */
export function mockNotFound(fetch: jest.Mock, url: string) {
  when(fetch)
    .calledWith(url, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({
        "Content-Type": "text/plain",
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "text/n3",
      }),
      text: () => Promise.resolve("Not Found"),
    } as Response);
}

/**
 * Mock a 403 - Forbidden response for the given URL
 * @param fetch - A mocked fetch function
 * @param url - The URL to mock
 */
export function mockForbidden(fetch: jest.Mock, url: string) {
  when(fetch)
    .calledWith(url, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 403,
      statusText: "Forbidden",
      headers: new Headers({
        "Content-Type": "text/plain",
        "wac-allow": 'user="read write append control",public=""',
      }),
      text: () => Promise.resolve("You do not have access to this resource."),
    } as Response);
}
