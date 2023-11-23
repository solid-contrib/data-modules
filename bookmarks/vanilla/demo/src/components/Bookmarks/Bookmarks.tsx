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
} from "../../../../dist";

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
      bookmarkTitle,
      bookmarkLink,
      session
    );
    setBookmarks(updatedDataset);
    setbookmarkTitle("");
    setbookmarkLink("");
  };

  // const deleteBookmark = async (args: any, session: Session) => {
  //   const indexUrl = await getBookmarksIndexUrl(session);
  //   // const indexUrl = getSourceUrl(ds);

  //   const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

  //   const thing = getThing(ds, args.url)
  //   const updatedBookmarks = removeThing(ds, thing!);
  //   const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarks, { fetch });

  //   const things = getThingAll(updatedDataset)

  //   const res = things.map(thing => {
  //     return {
  //       url: thing.url,
  //       title: getLiteral(thing, DCTERMS.title)?.value,
  //       link: getLiteral(thing, BOOKMARK.recalls)?.value
  //     }
  //   }) as IBookmark[]
  //   // setBookmarks(res);
  // };

  // const bookmarkThings =
  //   bookmarks && bookmarks?.graphs?.default ? getThingAll(bookmarks) : [];

  // const thingsArray = bookmarkThings
  //   .filter((t) => getUrl(t, RDF.type) === BOOKMARK.Bookmark)
  //   .map((t) => ({ dataset: bookmarks, thing: t }));

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
                        onClick={async () => console.log(await Bookmark.update("sdvsdv", "sdvs", row.url, session))}
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
    </Box>
  );
};

export default Bookmarks;
