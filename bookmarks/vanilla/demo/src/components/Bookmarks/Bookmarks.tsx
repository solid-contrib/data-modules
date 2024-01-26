import AppFlex from "@/components/Shared/AppFlex";

import { useSession } from "@inrupt/solid-ui-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Link,
  TextField,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { FC, useEffect, useState } from "react";


import {
  Bookmark,
  IBookmark,
} from "../../../../src";

declare global {
  interface Window {
    Bookmark?: Bookmark;
    fetcher?: unknown;
    webId?: unknown;
  }
}
window.Bookmark =  Bookmark || {};

type IProps = {};

const Bookmarks: FC<IProps> = ({ }) => {
  const [bookmarkToUpdate, setBookmarkToUpdate] = useState<undefined | IBookmark>(undefined);
  const { session } = useSession();
  window.fetcher = session?.fetch;
  window.webId = session?.info?.webId;

  const { info: { isLoggedIn } } = session;

  const [bookmarkTitle, setbookmarkTitle] = useState("");
  const [bookmarkLink, setbookmarkLink] = useState("");

  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);

  let loading = false;

  async function loadBookmarks() {
    if (loading) {
      console.log("Already loading, skip");
      return;
    }
    console.log("Loading bookmarks");
    loading = true;
    const list = await Bookmark.getAll(session.fetch, session.info.webId!);
    setBookmarks(list);
    loading = false;
    console.log("Loaded bookmarks");
  }

  useEffect(() => {
    if (session && isLoggedIn) loadBookmarks();
  }, [session, isLoggedIn]);

  const handleSubmit = async () => {
    if (bookmarkToUpdate) {
      // TODO: Update
      const payload = {
        title: bookmarkTitle,
        link: bookmarkLink,
      }
      const res = await Bookmark.update(bookmarkToUpdate.url, payload, session.fetch)
      console.log(res)


      loadBookmarks()

      setbookmarkTitle("");
      setbookmarkLink("");

      setBookmarkToUpdate(undefined);
    } else {
      // TODO: Create
      const updatedDataset = await Bookmark.create(
        {
          title: bookmarkTitle,
          link: bookmarkLink,
        },
        session.fetch,
        session.info.webId!
      );
      setbookmarkTitle("");
      setbookmarkLink("");
    }
  };

  useEffect(() => {
    bookmarkToUpdate && setbookmarkLink(bookmarkToUpdate?.link)
    bookmarkToUpdate && setbookmarkTitle(bookmarkToUpdate?.title)
  }, [bookmarkToUpdate])


  return (
    <Box>
      <Card>
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
            <Button
              variant="outlined"
              size="medium"
              onClick={handleSubmit}
            >
              {bookmarkToUpdate ? "Update" : "Add"}
            </Button>
          </AppFlex>
          <TableContainer component={Paper}>
            <Table
              size="small"
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookmarks?.map((row) => (
                  <TableRow key={row.url}>
                    <TableCell
                      component="th"
                      scope="row"
                      onClick={async () => console.log(await Bookmark.get(row.url, session.fetch))}
                    >
                      {row.title}
                    </TableCell>
                    <TableCell>
                      <Link
                        target="_blank"
                        href={row.link}
                      >
                        {row.link}
                      </Link>
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                    >
                      <IconButton
                        onClick={async () => {
                          console.log(await Bookmark.delete(row.url, session.fetch))
                          loadBookmarks()
                        }}
                      >
                        DEL
                      </IconButton>
                      <IconButton

                        onClick={async () => {
                          setBookmarkToUpdate(row)
                        }}
                      >
                        UPD
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box >
  );
};

export default Bookmarks;
