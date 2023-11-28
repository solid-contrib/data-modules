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

type IProps = {};

const Bookmarks: FC<IProps> = ({ }) => {
  const { session } = useSession();
  const {
    info: { isLoggedIn },
  } = session;

  const [bookmarkTitle, setbookmarkTitle] = useState("");
  const [bookmarkLink, setbookmarkLink] = useState("");

  // const { bookmarks, setBookmarks } = usebookmarks();

  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);

  async function initBookmarks() {
    const list = await Bookmark.getAll(session);
    setBookmarks(list);
  }

  useEffect(() => {
    if (session && isLoggedIn) initBookmarks();
  }, [session, isLoggedIn]);

  const handleSubmit = async () => {
    const updatedDataset = await Bookmark.create(
      {
        title: bookmarkTitle,
        link: bookmarkLink,
      },
      session
    );
    // setBookmarks(updatedDataset);
    setbookmarkTitle("");
    setbookmarkLink("");
  };

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
              ADD
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
                      onClick={async () => console.log(await Bookmark.get(row.url, session))}
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
                        onClick={async () => console.log(await Bookmark.delete(row.url, session))}
                      >
                        DEL
                      </IconButton>
                      <IconButton
                        onClick={async () => console.log(row.url , await Bookmark.update(row.url, {
                          title: "sss__",
                          link: "http://sss__.com",
                        }, session))}
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
