import { Auth } from "@/utils/auth";
import { VCARD } from "@inrupt/lit-generated-vocab-common";
import {
  CombinedDataProvider,
  Image,
  useSession,
} from "@inrupt/solid-ui-react";
import PersonIcon from "@mui/icons-material/Person";

import LogoutIcon from "@mui/icons-material/Logout";
import { FormControl, InputLabel, Select } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import React, { FC, useState } from "react";
import { OIDC_PROVIDERS } from "../../constants/oidcProviders";
import AppLink from "../AppLink/AppLink";
import AppLogo from "./AppLogo";

type IProps = {};

const AppHeader: FC<IProps> = ({}) => {
  const {
    session: {
      info: { isLoggedIn },
    },
  } = useSession();


  return (
    <AppBar
      position="static"
      variant="elevation"
      color="default"
      enableColorOnDark
      // sx={{ borderRadius: 2, overflow: "hidden" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flex={1}
            gap={1}
          >
            <Box flex={2} display="flex" justifyContent="flex-start">
              <AppLogo />
            </Box>
            <Box
              flex={8}
              sx={{
                display: "flex",
                // display: {
                //   xs: "none",
                //   sm: "flex",
                // },
                gap: 2,
              }}
              justifyContent="center"
            >
            </Box>
            <Box flex={2} display="flex" justifyContent="flex-end">
              {!isLoggedIn && <AppLoginDialog />}
              {isLoggedIn && <AppProfileMenu />}
              {/* {isLoggedIn && <Button onClick={() => logout()}>O</Button>} */}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppHeader;

const AppLoginDialog: FC<{}> = ({}) => {
  const [open, setOpen] = React.useState(false);
  const [oidcIssuer, setOidcIssuer] = useState(() => OIDC_PROVIDERS[0].value);

  return (
    <div>
      <Button
        //
        variant="outlined"
        // color="#fff"
        // sx={{}}
        onClick={() => setOpen(true)}
      >
        Login
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent sx={{ width: 400 }}>
          <DialogContentText>Choose your Identity Provider.</DialogContentText>
          <Box display="flex" sx={{ marginTop: 4, gap: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Provider</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={oidcIssuer}
                onChange={(e) => setOidcIssuer(e.target.value)}
                label="Provider"
              >
                {OIDC_PROVIDERS.map((x) => (
                  <MenuItem key={x.value} value={x.value}>
                    {x.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={async () => await Auth.login(oidcIssuer)}
            >
              Login
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AppProfileMenu: FC<{}> = ({}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    session: {
      info: { webId },
      logout,
    },
    sessionRequestInProgress,
  } = useSession();

  return (
    <Box display="flex" gap={1}>
      {sessionRequestInProgress && "sessionRequestInProgress"}
      {webId && (
        <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ p: 0 }}
              >
                <Image
                  property={VCARD.hasPhoto.iri.value}
                  width={40}
                  loadingComponent={() => <Avatar alt="Remy Sharp" />}
                  errorComponent={() => <Avatar alt="Remy Sharp" />}
                  style={{ borderRadius: "50%" }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <AppLink href={"/bookmarks"}>
                <MenuItem sx={{ display: "flex", gap: 1 }}>
                  <PersonIcon />
                  <Typography textAlign="center">Bookmarks</Typography>

                </MenuItem>
              </AppLink>
              <MenuItem
                onClick={() =>
                  logout().then(() => {
                    window.location.replace("/");
                  })
                }
                sx={{ display: "flex", gap: 1 }}
              >
                <LogoutIcon sx={{ color: red[400] }} />
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </CombinedDataProvider>
      )}
    </Box>
  );
};
