import AdbIcon from "@mui/icons-material/Adb";
import Typography from "@mui/material/Typography";
import { FC } from "react";

import AppLink from "../AppLink/AppLink";

type IProps = {};

const AppLogo: FC<IProps> = ({}) => {
  return (
    <AppLink
      href="/"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        // bgcolor: "red",
      }}
    >
      <AdbIcon />
      <Typography
        variant="h6"
        noWrap
        sx={{
          ml: 2,
          bgColor: "secondary.main",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        Bookmarker
      </Typography>
    </AppLink>
  );
};

export default AppLogo;
