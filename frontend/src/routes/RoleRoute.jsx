import { Navigate } from "react-router-dom";
import useTokenStore from "../stores/tokenStore";

const RoleRoute = ({ children, allowedRoles }) => {
  const { role } = useTokenStore();
  return allowedRoles.includes(role) ? children : <Navigate to="/unauthorized" replace />;
};

export default RoleRoute;