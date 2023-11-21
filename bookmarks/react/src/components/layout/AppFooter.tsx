import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { FC } from "react";
import AppLink from "../AppLink/AppLink";
import AppToggleColorMode from "./AppToggleColorMode";

type IProps = {};

const AppFooter: FC<IProps> = ({}) => {
  return (
    <AppBar
      position="static"
      variant="elevation"
      color="default"
      enableColorOnDark
    >
      <AppToggleColorMode />
      <Container maxWidth="xl">
        <Toolbar disableGutters>
         
          <Box
            sx={{
              p: 3,
              flex: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{
                textDecoration: "none",
              }}
            >
              {"Copyright © "}
              <AppLink
                href="https://pondersource.com/"
                sx={{
                  color: "teal",
                }}
              >
                Ponder Source
              </AppLink>{" "}
              {new Date().getFullYear()}
              {"."}
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppFooter;
