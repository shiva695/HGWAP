import { useCookies } from "react-cookie";
import { Navigate, useLocation } from "react-router-dom";
import { config } from "../../../config/config";

const ProtectedRoute = ({ children }) => {
  const [cookies] = useCookies([config.cookieName]);
  const location = useLocation();

  if (
    !(
      !!cookies[config.cookieName] &&
      !!cookies[config.cookieName].token &&
      !!cookies[config.cookieName].loginUserId
    )
  ) {
    return (
      <Navigate
        to="/login"
        replace={true}
        state={{ redirectTo: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
