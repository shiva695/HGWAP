import { CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { reset } from "../../../global/redux/actions";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line
  const [cookies, setCookie, removeCookie] = useCookies([]);

  useEffect(() => {
    if (cookies[config.cookieName]) {
      removeCookie(config.cookieName, { path: "/" });
    }
    if (cookies[config.preferencesCookie]) {
      removeCookie(config.preferencesCookie, { path: "/" });
    }
    dispatch(reset());
    navigate("/", { replace: true });
  }, [cookies, dispatch, navigate, removeCookie]);

  return <CircularProgress sx={{ margin: "auto" }} />;
};

export default Logout;
