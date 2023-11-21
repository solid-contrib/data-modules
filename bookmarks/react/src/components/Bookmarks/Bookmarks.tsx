import { usebookmarks } from "@/atoms/bookmarks.atom";
import AppFlex from "@/components/Shared/AppFlex";
import {
  createBookmark,
  getBookmarksIndexUrl,
  getOrCreateBookmarks,
} from "@/utils";
import {
  getThingAll,
  getUrl,
  removeThing,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import {
  CombinedDataProvider,
  Table,
  TableColumn,
  useSession,
  useThing,
} from "@inrupt/solid-ui-react";
import {
  BOOKMARK,
  DCTERMS,
  RDF,
  SCHEMA_INRUPT,
} from "@inrupt/vocab-common-rdf";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Link,
  TextField,
} from "@mui/material";
import { FC, useEffect, useState } from "react";

type IProps = {};

const Bookmarks: FC<IProps> = ({}) => {
  const { session } = useSession();
  const {
    info: { isLoggedIn, webId },
    fetch,
  } = session;

  const [bookmarkTitle, setbookmarkTitle] = useState("");
  const [bookmarkLink, setbookmarkLink] = useState("");
  const { bookmarks, setBookmarks } = usebookmarks();

  async function initBookmarks() {
    const list = await getOrCreateBookmarks(session);
    setBookmarks(list as any);
  }

  useEffect(() => {
    if (session && isLoggedIn) initBookmarks();
  }, [session, isLoggedIn]);

  const handleSubmit = async () => {
    const updatedDataset = await createBookmark(
      bookmarkTitle,
      bookmarkLink,
      session
    );
    setBookmarks(updatedDataset);
    setbookmarkTitle("");
    setbookmarkLink("");
  };

  const deleteBookmark = async (todo: any) => {
    // const bookmarksIndexUrl = getSourceUrl(bookmarks);
    const bookmarksIndexUrl = await getBookmarksIndexUrl(session);
    const updatedBookmarks = removeThing(bookmarks, todo);
    const updatedDataset = await saveSolidDatasetAt(
      bookmarksIndexUrl,
      updatedBookmarks,
      { fetch }
    );
    setBookmarks(updatedDataset);
  };

  const bookmarkThings =
    bookmarks && bookmarks?.graphs?.default ? getThingAll(bookmarks) : [];

  const thingsArray = bookmarkThings
    .filter((t) => getUrl(t, RDF.type) === BOOKMARK.Bookmark)
    .map((t) => ({ dataset: bookmarks, thing: t }));

  return (
    <Box>
      {webId && (
        <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
          <Card sx={{ maxWidth: 520, borderRadius: 2 }}>
            <CardContent>
              <AppFlex sx={{ gap: 1 }}>
                <TextField
                  onChange={(e) => setbookmarkTitle(e.target.value)}
                  label="Title"
                  value={bookmarkTitle}
                  size="small"
                  autoComplete="off"
                />
                <TextField
                  onChange={(e) => setbookmarkLink(e.target.value)}
                  label="Link"
                  value={bookmarkLink}
                  autoComplete="off"
                  size="small"
                />
                <Button variant="outlined" size="medium" onClick={handleSubmit}>
                  ADD
                </Button>
              </AppFlex>
              <Box>
                <Table className={`table`} things={thingsArray}>
                  <TableColumn property={DCTERMS.title} header="text" />
                  <TableColumn
                    property={BOOKMARK.recalls}
                    header="link"
                    body={({ value }: { value: string }) => (
                      <Link target="_blank" href={value}>
                        {value}
                      </Link>
                    )}
                  />
                  <TableColumn
                    property={SCHEMA_INRUPT.text}
                    header="Delete"
                    body={() => (
                      <DeleteBookmark deleteBookmark={deleteBookmark} />
                    )}
                  />
                </Table>
              </Box>
            </CardContent>
          </Card>
        </CombinedDataProvider>
      )}
    </Box>
  );
};

export default Bookmarks;

const DeleteBookmark = ({ deleteBookmark }: any) => {
  const { thing } = useThing();
  return (
    <IconButton onClick={() => deleteBookmark(thing)}>
      <DeleteIcon />
    </IconButton>
  );
};
