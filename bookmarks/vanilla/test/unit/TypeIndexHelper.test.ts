import inruptSOLIDClient, { Thing } from '@inrupt/solid-client';
import { TypeIndexHelper } from '../../src/utils/TypeIndexHelper'; // Replace with the actual import statement for your API class
import { Session } from "@inrupt/solid-client-authn-browser";
import { readFileSync } from 'fs';
import { namedNode } from '@rdfjs/data-model';

export function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}


describe('getFromTypeIndex', () => {
    let session: jest.Mocked<Session>;

    beforeEach(() => {

        session = {
            fetch: jest.fn(),
            info: {
                webId: "https://fake-pod.net/profile/card#me",
                isLoggedIn: true,
                sessionId: "123",
                clientAppId: "https://clientAppId.com",
                expirationDate: new Date().getDate() + 1000000000,
            },
            logout: jest.fn(),
            login: jest.fn(),
        } as unknown as jest.Mocked<Session>;
    });

    it('The getMeProfile method should return meProfile', async () => {
        // Arrange
        const mock_Fetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(fetchResponse("profile.ttl")));

        const mockGetThing = jest.spyOn(inruptSOLIDClient, 'getThing').mockResolvedValue(loadFixture("me.json"));

        // Act
        const result = await TypeIndexHelper.getMeProfile(session);

        // Assert
        expect(result).toEqual(loadFixture("me.json"));

        // Tear down
        mock_Fetch.mockRestore();
        mockGetThing.mockRestore();
    })


    it("The getTypeIndex method should return typeIndex", async () => {
        // Arrange

        const mock_Fetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(fetchResponse("profile.ttl")));
        const mockGetThing = jest.spyOn(inruptSOLIDClient, 'getThing').mockResolvedValue(loadFixture("me.json"));
        const mock_getNamedNode = jest.spyOn(inruptSOLIDClient, 'getNamedNode').mockResolvedValue(namedNode("https://fake-pod.net/settings/privateTypeIndex.ttl") as never);

        // Act
        const result = await TypeIndexHelper.getTypeIndex(session, true);

        // Assert
        expect(result).toEqual(namedNode("https://fake-pod.net/settings/privateTypeIndex.ttl"));

        // Tear down
        mock_Fetch.mockRestore();
        mockGetThing.mockRestore();
        mock_getNamedNode.mockRestore();

    })


    it("The getFromTypeIndex method should return registeries from typeIndex", async () => {

        // Arrange
        const mock_getTypeIndex = jest.spyOn(TypeIndexHelper, 'getTypeIndex').mockResolvedValue(namedNode("https://fake-pod.net/settings/privateTypeIndex.ttl") as never);

        const mock_Fetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(fetchResponse("privateTypeIndex.ttl")));

        // Act
        const res = await TypeIndexHelper.getFromTypeIndex(session, true);

        // Assert
        expect(res.length).toBeGreaterThan(0);

        // Tear down
        mock_getTypeIndex.mockRestore()
        mock_Fetch.mockRestore()
    })

    it("The registerInTypeIndex method should register in typeIndex", async () => {
        const mock_getTypeIndex = jest.spyOn(TypeIndexHelper, 'getTypeIndex').mockResolvedValue(namedNode("https://fake-pod.net/settings/privateTypeIndex.ttl") as never);
        const mock_Fetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(fetchResponse("privateTypeIndex.ttl")));

        const mock_setThing = jest.spyOn(inruptSOLIDClient, "setThing").mockReturnValue(loadFixture("privateTypeIndexDS.json"));
        const mock_saveSolidDatasetAt = jest.spyOn(inruptSOLIDClient, "saveSolidDatasetAt").mockReturnValue(loadFixture("privateTypeIndexDS.json"));


        const res = await TypeIndexHelper.registerInTypeIndex(session, "https://fake-pod.net/settings/privateTypeIndex.ttl", true)
        // Assert

        expect(res).toEqual(loadFixture("privateTypeIndexDS.json"));

        // Tear down
        mock_getTypeIndex.mockRestore();
        mock_Fetch.mockRestore();
        mock_setThing.mockRestore();
        mock_saveSolidDatasetAt.mockRestore();
    })

    it("The createTypeIndex method should create typeIndex", async () => {
        // Arrange
        const mock_Fetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(fetchResponse("privateTypeIndex.ttl")));

        // Act
        const res = await TypeIndexHelper.createTypeIndex(session, "https://fake-pod.net/settings/privateTypeIndex.ttl");

        // Assert
        expect(res).toBeDefined();

        mock_Fetch.mockRestore();
    })
});



const fetchResponse = (fileName: string): Promise<Response> => {
    return Promise.resolve({
        status: 200,
        ok: true,
        headers: {
            get: (h: string) => (h == "Content-Type" ? "text/turtle" : undefined)
        },
        text: () => {
            return Promise.resolve(loadFixture(fileName));
        }
    }) as any;
}