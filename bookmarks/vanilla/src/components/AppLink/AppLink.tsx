import { LinkProps, Link as MuiLink } from "@mui/material";
import { Link as ReactRouterLink } from "react-router-dom";

import { FC } from "react";
// import { useSession } from "@inrupt/solid-ui-react";

const AppLink: FC<LinkProps> = (props) => {
  // const {
  //   session: {
  //     info: { isLoggedIn },
  //   },
  // } = useSession();

  return (
    <MuiLink
      {...props}
      component={ReactRouterLink}
      sx={{
        color: "inherit",
        textDecoration: "none",
        ...props.sx,
      }}
      to={props.href ?? "#"}
    />
  );
};

export default AppLink;

// const AppLinkWrapper: FC<{ isPrivateRoute: boolean }> = ({isPrivateRoute}) => {
//   if (!isPrivateRoute) {
//     return <>{AppLink}</>;
//   } else {
//     if (isLoggedIn) {
//       return <>{Comp}</>;
//     }
//   }
// };
