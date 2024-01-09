import { useEffect, useMemo } from "react";
import { useUserSession } from "./atoms/userSession.atom";
import { doLogin, doLogout, handleRedirectAfterLogin } from "./utils";
import { Fetcher, UpdateManager, graph, namedNode, parse } from 'rdflib'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Input,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import * as $rdf from "rdflib";

import { useState } from "react";

// @ts-expect-error
import solidNamespace from "solid-namespace";


const ns = solidNamespace($rdf);

function App() {
  const { userSession, setUserSession } = useUserSession();
  // const {  } = userSession
  const [form, setForm] = useState({ title: "", link: "", topic: "" });

  useEffect(() => {
    (async () => {
      await handleRedirectAfterLogin(async (loggedInSession) => setUserSession(loggedInSession));
    })();
  }, []);


  const [store, fetcher, updater] = useMemo(() => {
    const store = graph();
    return [store, new Fetcher(store, { fetch: userSession?.fetch }), new UpdateManager(store)];
  }, [userSession?.fetch]);

  // userSession?.fetch
  const [name, setName] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);


  const profileNode = namedNode(userSession?.info.webId!);

  useEffect(() => {
    fetcher.load(profileNode.doc())
      .then(() => setName(store.any(profileNode, ns.foaf("name"), null)?.value ?? ""))
      .catch(setError);
  }, [store, profileNode, fetcher]);
  return (
    <Container>

      {!userSession?.info.isLoggedIn && (
        <Box>
          <Button onClick={doLogin}>Login</Button>
        </Box>
      )}

      {userSession?.info.isLoggedIn && (
        <Box>
          <Button onClick={doLogout}>Logout</Button>
          <Text>Logged in as:</Text>
          <Link href={userSession?.info.webId}>
            {userSession?.info.webId && userSession?.info.webId}
          </Link>
          <Flex gap={2}>
            <Input
              value={form?.title}
              placeholder="title"
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, title: e.target.value }))
              }
            />
            <Input
              value={form?.topic}
              placeholder="topic"
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, topic: e.target.value }))
              }
            />
            <Input
              value={form?.link}
              placeholder="link"
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, link: e.target.value }))
              }
            />

            <Button
              onClick={async () => {
                // const factory = await BookmarkFactory.getInstance(
                //   {
                //     webId: userSession?.info.webId ?? "",
                //     fetch: userSession?.fetch,
                //     isPrivate: true,
                //   }
                // );
                // const bookmark = await factory.create(form);
                // setForm({ title: "", link: "", topic: "" });
                // const bookmarks = await factory.getAll();
                // setBookmarks(bookmarks);
              }}
            >
              ADD
            </Button>
          </Flex>
          <div>
            <Table
              variant="striped"
              size="sm"
            >
              <Thead>
                <Tr>
                  <Th>title</Th>
                  <Th>topic</Th>
                  <Th>Link</Th>
                  <Th>actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* bookmarks */}
                {([] as any).map((b: any, i: number) => (
                  <Tr key={i}>
                    <Td>{b.title}</Td>
                    <Td>{b.topic}</Td>
                    <Td>
                      <a>{b.link}</a>
                    </Td>
                    <Td>
                      <ButtonGroup variant="outline">
                        <Button
                          onClick={async () => {
                            // const factory = await BookmarkFactory.getInstance({
                            //   webId: userSession?.info.webId ?? "",
                            //   fetch: userSession?.fetch,
                            //   isPrivate: true,
                            // });
                            // const bookmark = await factory.get(b.url);
                          }}
                        >
                          GET
                        </Button>

                        <Button
                          onClick={async () => {
                            // const factory = await BookmarkFactory.getInstance({
                            //   webId: userSession?.info.webId ?? "",
                            //   fetch: userSession?.fetch,
                            //   isPrivate: true,
                            // });
                            // const bookmark = await factory.update(b.url, {
                            //   ...(b as any),
                            //   label: (Math.random() + 1).toString(36).substring(7),
                            // });
                          }}
                        >
                          UPD
                        </Button>

                        <Button
                          onClick={async () => {
                            // const factory = await BookmarkFactory.getInstance({
                            //   webId: userSession?.info.webId ?? "",
                            //   fetch: userSession?.fetch,
                            //   isPrivate: true,
                            // });
                            // await factory.remove(b.url);
                          }}
                        >
                          DEL
                        </Button>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </Box>
      )}
    </Container>
  );
}

export default App;
