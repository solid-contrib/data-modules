import { useEffect } from "react";
import { useUserSession } from "./atoms/userSession.atom";
import { bootSoukai, doLogin, doLogout, handleRedirectAfterLogin } from "./utils";


import BookmarksComp from "./components/Bookmarks";
import { Box, Button, Container, Link, Text } from "@chakra-ui/react";
// import { useSayHello } from "lerna-tool";

function App() {
  const { userSession, setUserSession } = useUserSession();


  useEffect(() => {
    (async () => {
      await handleRedirectAfterLogin(async (loggedInSession) => {
        setUserSession(loggedInSession);
        bootSoukai(loggedInSession.fetch)
      });
    })();
  }, []);

  // useSayHello({ msg: "jjjjj" });



  return (
    <Container>
      {userSession?.info.isLoggedIn ? <LoggedInView /> : <GuestInView />}
    </Container>
  );
}

export default App;

const LoggedInView = () => {
  const { userSession } = useUserSession();

  return (
    <Box>
      <Button onClick={doLogout}>Logout</Button>
      <Text>
        Logged in as:
      </Text>
      <Link href={userSession?.info.webId}>{userSession?.info.webId && userSession?.info.webId}</Link>
      <BookmarksComp />
    </Box>
  );
};


const GuestInView = () => {
  return (
    <Box>
      <Button onClick={doLogin}>Login</Button>
    </Box>
  );
};
