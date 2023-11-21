import { useSession } from "@inrupt/solid-ui-react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginCallBack: FC<{}> = ({ }) => {
  const navigate = useNavigate()

  const { session: { info: { isLoggedIn } } } = useSession();

  useEffect(() => {
   const t = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
    
    return () => clearTimeout(t);
  }, [isLoggedIn])

  return (
    <Box>
      <Typography>Redirecting...</Typography>
      <LinearProgress color="inherit" />
    </Box>
  );
};

export default LoginCallBack;