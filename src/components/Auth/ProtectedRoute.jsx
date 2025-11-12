import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { isAuthenticated } from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/Login" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
