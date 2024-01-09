import {
  ISessionInfo,
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
// import { Bookmark } from "../../src/modules/Bookmarks";
// import { v4 } from "uuid";
// import { BookmarkModel, TopicModel } from "./components/Bookmarks";

export async function doLogin() {
  await login({
    clientName: "solid-soukai-app",
    oidcIssuer: "https://solidcommunity.net",
    redirectUrl: window.location.href,
  });
}

export function doLogout() {
  logout();
  // .then(() => {
  //     // location.reload()
  // })
  window.location.reload();
}

export async function handleRedirectAfterLogin(
  cb: (loggedInSession: Session) => void
) {
  const sessionInfo: ISessionInfo | undefined = await handleIncomingRedirect({
    restorePreviousSession: true,
  }); // no-op if not part of login redirect
  const session = getDefaultSession();
  if (session.info.isLoggedIn) {
    cb(session); // setUserSession(session)
    // setEngine(new SolidEngine(session.fetch));
    window.fetch = session.fetch;
  }
}


export function urlRoot(url: string): string {
  const protocolIndex = url.indexOf("://") + 3;
  const pathIndex = url.substring(protocolIndex).indexOf("/");

  return pathIndex !== -1 ? url.substring(0, protocolIndex + pathIndex) : url;
}

export function urlParentDirectory(url: string): string | null {
  if (url.endsWith("/")) url = url.substring(0, url.length - 1);

  if (urlRoot(url) === url) return null;

  const pathIndex = url.lastIndexOf("/");

  return pathIndex !== -1 ? url.substring(0, pathIndex + 1) : null;
}

