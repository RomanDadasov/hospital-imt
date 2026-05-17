import { Navigate } from "react-router-dom";
import useTokenStore from "../stores/tokenStore";

const PrivateRoute = ({ children }) => {
  const { accessToken } = useTokenStore();
  return accessToken ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;