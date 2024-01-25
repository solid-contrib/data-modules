import {
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";
import { Fetcher, Namespace, graph } from 'rdflib'
import { Bookmark, IBookmark } from '../../src/index'

const dct = Namespace("http://purl.org/dc/terms/");

const bookmarksURL = "https://solid-dm.solidcommunity.net/bookmarks/"
const bookmarkURL = "https://solid-dm.solidcommunity.net/bookmarks/90f33a54-34e5-4c64-aaa7-0c9fc0450357"
const bookmarkToUpdateURL = "https://solid-dm.solidcommunity.net/bookmarks/bea593de-74dd-4f8b-8a50-caa0cf790077"
const bookmarkToDeleteURL = "https://solid-dm.solidcommunity.net/bookmarks/db519a5a-6fdb-4137-9ac6-372d5ba07dc4/index.ttl"

async function startLogin() {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: "https://solidcommunity.net",
      redirectUrl: new URL("/", window.location.href).toString(),
      clientName: "My application",
    });
  }
}

export default function App() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(session?.info.isLoggedIn ?? false);

  useEffect(() => {
    (async () => {
      await handleIncomingRedirect({ restorePreviousSession: true });
      const session = getDefaultSession();
      setSession(session);
      setIsLoggedIn(session.info.isLoggedIn);
    })();
  }, []);

  return (
    <>
      {session?.info.webId}
      {isLoggedIn ? <AuthenticatedView session={session} /> : <GuestView />}
      <a href="/">Home</a>
    </>
  );
}

const GuestView = () => {
  return (
    <button onClick={startLogin}>Loggin</button>
  )
}


const AuthenticatedView = ({ session }: { session?: Session }) => {
  // const [bookmarks, setBookmarks] = useState<(IBookmark)[]>([]);




  const handleGetBookmark = async () => {
    var store = graph()
    var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })

    const bookmark = new Bookmark({ fetcher, store })
    const data = await bookmark.get(bookmarksURL)
    console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  const handleGetBookmarks = async () => {
    // var store = graph()
    // var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })
    // setBookmarks()
    // const bookmark = new Bookmark({ fetcher, store })
    // const data = await bookmark.getAll(bookmarksURL)
    // console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  const handleCreateBookmark = async () => {
    var store = graph()
    var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })

    const bookmark = new Bookmark({ fetcher, store })
    const data = await bookmark.create(bookmarksURL, { title: "some value", link: "http://somelik.com", topic: "http://sometopicuri.com", creator: "http://someone.cpm" })
    console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  const handleUpdateBookmark = async () => {
    var store = graph()
    var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })

    const bookmark = new Bookmark({ fetcher, store })
    let randomStr = (Math.random() + 1).toString(36).substring(7);
    const data = await bookmark.update(bookmarkToUpdateURL, { title: randomStr, link: `http://${randomStr}.com`, topic: `http://${randomStr}.com`, creator: `http://${randomStr}.com` })
    console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  const handleDeleteBookmark = async () => {
    var store = graph()
    var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })

    const bookmark = new Bookmark({ fetcher, store })

    const data = await bookmark.delete(bookmarkToDeleteURL)
    console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  // bookmarkToDeleteURL
  return (
    <>
      <div>
        <button onClick={() => logout()}>Logout</button>
        <button onClick={handleGetBookmarks}>GET ALL</button>
        <button onClick={handleGetBookmark}>GET</button>
        <button onClick={handleCreateBookmark}>CREATE</button>
        <button onClick={handleUpdateBookmark}>UPDATE</button>
        <button onClick={handleDeleteBookmark}>DELETE</button>
      </div>
      {/* <table>
        <thead>
          <tr>
            <th>title</th>
            <th>topic</th>
            <th>Link</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {bookmarks?.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td>
              <td>{b.topic}</td>
              <td><a>{b.link}</a></td>
              <td>
                <div>
                  <button
                    onClick={async () => {
                    }}
                  >
                    GET
                  </button>

                  <button
                    onClick={async () => { }}
                  >
                    UPD
                  </button>

                  <button
                    onClick={async () => { }}
                  >
                    DEL
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  )
}
