import { Box, LinearProgress, Typography } from "@mui/material";
import { FC } from "react";

type Props = {
    title?: string
};

const AppLoading: FC<Props> = ({ title = "Loading..." }) => {
    return (
        <Box>
            <Typography>{title}</Typography>
            <LinearProgress color="inherit" />
        </Box>
    );
};

export default AppLoading;
