import { when } from "jest-when";

export function mockTurtleDocument(fetch: jest.Mock, uri: string, ttl: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
        link: '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "text/n3",
      }),
      text: () => Promise.resolve(ttl),
    } as Response);
}

export function mockLdpContainer(fetch: jest.Mock, uri: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
        link: '<http://www.w3.org/ns/ldp#Container>; rel="type"',
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "text/n3",
      }),
      text: () =>
        Promise.resolve(`
      @prefix dc: <http://purl.org/dc/terms/>.
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      <> a ldp:Container, ldp:BasicContainer, ldp:Resource .
`),
    } as Response);
}

export function mockNotFound(fetch: jest.Mock, uri: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
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

export function mockForbidden(fetch: jest.Mock, uri: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
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
