import { when } from "jest-when";

export function mockTurtleResponse(fetch: jest.Mock, uri: string, ttl: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
        "wac-allow": 'user="read write append control",public="read"',
        "accept-patch": "application/sparql-update",
      }),
      text: () => Promise.resolve(ttl),
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
        "accept-patch": "application/sparql-update",
      }),
      text: () => Promise.resolve("Not Found"),
    } as Response);
}
