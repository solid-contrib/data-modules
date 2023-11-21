import { useSession } from "@inrupt/solid-ui-react";
import { FC } from "react";
import { Navigate, Outlet, RouteProps } from "react-router-dom";

export const PrivateRoute: FC<RouteProps> = () => {
  const {
    session: {
      info: { isLoggedIn },
    },
  } = useSession();
  if (!isLoggedIn) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
};
