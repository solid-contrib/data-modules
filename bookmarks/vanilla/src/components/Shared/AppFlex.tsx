import { Box } from "@mui/material";
import { BoxProps } from "@mui/material/Box";
import { FC } from "react";

const AppFlex: FC<BoxProps> = (props) => <Box display={"flex"} {...props} />;

export default AppFlex;
