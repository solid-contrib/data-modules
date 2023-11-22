import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { FC } from "react";
import { useAppTheme } from "../../hooks/useAppTheme";

type IProps = {
  children: React.ReactElement | React.ReactElement[];
};
const AppThemeProvider: FC<IProps> = ({ children }) => {
  const { theme } = useAppTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
