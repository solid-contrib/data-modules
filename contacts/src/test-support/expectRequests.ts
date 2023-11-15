export function expectPatchRequest(
  authenticatedFetch: jest.Mock,
  url: string,
  expectedBody: string,
) {
  expect(authenticatedFetch).toHaveBeenCalledWith(url, expect.anything());

  const calls = authenticatedFetch.mock.calls;
  const updateRequest = calls.find(
    (it) => it[0] === url && it[1].method === "PATCH",
  );
  expect(updateRequest).toBeDefined();
  const body = updateRequest[1].body;
  expect(body.trim()).toEqual(expectedBody);
}
