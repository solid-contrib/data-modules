import CssBaseline from "@mui/material/CssBaseline";
import { FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import AppThemeProvider from "./AppProviders/AppThemeProvider";
import { SessionProvider } from "@inrupt/solid-ui-react";

type IProps = {
  children: React.ReactElement;
};

const AppProviders: FC<IProps> = ({ children }) => {
  return (
    <SessionProvider>
      <RecoilRoot>
        <BrowserRouter>
          <AppThemeProvider>
            <CssBaseline />
            {children}
          </AppThemeProvider>
        </BrowserRouter>
      </RecoilRoot>
    </SessionProvider>
  );
};

export default AppProviders;
