import { createTheme } from "@mui/material";
import { useMemo } from "react";
import { useColorMode } from "../atoms/colorMode.atom";

// generate a black and white maerial ui theme palette 

export const useAppTheme = () => {
    const { colorMode } = useColorMode();
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: colorMode,
                    // primary: {
                    //     // main: colorMode === "light" ?"":"",
                    //     main: '#477d8d',
                    // },
                    // secondary: {
                    //     main: '#fff',
                    // },
                    // error: {
                    //     main: red.A400,
                    // },
                },
            }),
        [colorMode]
        // [prefersDarkMode]
    );

    return { theme }
};

