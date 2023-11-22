import { Route, Routes, useNavigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import PageNotFound from "./pages/404/PageNotFound";
import BookmarksPage from "./pages/Bookmarks/BookmarksPage";
// import HomePage from "./pages/Home/HomePage";
import { onSessionRestore } from "@inrupt/solid-client-authn-browser";
import { FC, useEffect } from "react";
import { PrivateRoute } from "./components/PrivateRoute";
import LoginCallBack from "./pages/LoginCallBack/LoginCallBack";
import { Auth } from "./utils/auth";



type Props = {}

const App: FC<Props> = ({ }) => {
  const navigate = useNavigate()

  useEffect(() => {
    Auth.completeLogin();
    onSessionRestore((currentUrl) => {
      // console.log("🚀 ~ file: App.tsx:17 ~ onSessionRestore ~ currentUrl:", currentUrl)
      navigate(currentUrl, { replace: true });
    });
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/callback" element={<LoginCallBack />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<BookmarksPage />} />
          {/* <Route path="/" element={<HomePage />} /> */}
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App
