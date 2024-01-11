import {
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";
import { Fetcher, graph } from 'rdflib'
const bookmarksURL = "https://solid-dm.solidcommunity.net/bookmarks/bookmark-formats.ttl"

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

    fetcher.nowOrWhenFetched(bookmarksURL, function (ok: boolean, message: string, response?: any) {
      if (!ok) {
        console.log("Oops, something happened and couldn't fetch data " + message);
      } else if (response.onErrorWasCalled || response.status !== 200) {
        console.log('    Non-HTTP error reloading data! onErrorWasCalled=' + response.onErrorWasCalled + ' status: ' + response.status)
      } else {
        console.log("---data loaded---")
        console.log("🚀 ~ response:", response.responseText)
      }
    })
    // await session?.fetch(bookmarksURL);
  }
  return (
    <div>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={handleGetBookmarks}>GET</button>
    </div>
  )
}
