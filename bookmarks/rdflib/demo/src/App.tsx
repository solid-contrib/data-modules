import {
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";
import { Fetcher, Namespace, graph } from 'rdflib'
import { Bookmark } from '../../src/index'

const dct = Namespace("http://purl.org/dc/terms/");

const bookmarksURL = "https://solid-dm.solidcommunity.net/bookmarks/"
const bookmarkURL = "https://solid-dm.solidcommunity.net/bookmarks/35e05e67-e1f3-4b85-89cf-e1dbfe07546c"

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


  const handleGetBookmarks = async () => {
    var store = graph()
    var fetcher = new Fetcher(store, { timeout: 5000, fetch: session?.fetch })

    const bookmark = new Bookmark({ fetcher, store })
    const data = await bookmark.getAll(bookmarksURL)
    console.log("🚀 ~ handleGetBookmarks ~ data:", data)
  }
  return (
    <div>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={handleGetBookmarks}>GET</button>
    </div>
  )
}
