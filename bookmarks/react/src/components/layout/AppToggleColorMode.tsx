import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { useColorMode } from "../../atoms/colorMode.atom";
type IProps = {};

const AppToggleColorMode: React.FC<IProps> = ({ }) => {
  const theme = useTheme();
  const { setColorMode } = useColorMode();
  // const isDark = colorMode === "dark";

  return (
    <Fab
      size="small"
      color="primary"
      aria-label="toggle color mode"
      sx={{
        position: "absolute",
        bottom: 86,
        right: 16,
      }}
      onClick={() => setColorMode((p) => (p === "light" ? "dark" : "light"))}
    >
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </Fab>
  );
};

export default AppToggleColorMode;
