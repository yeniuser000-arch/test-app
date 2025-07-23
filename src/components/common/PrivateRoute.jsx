import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = !!localStorage.getItem("kullanici_id");
  const isAdmin = localStorage.getItem("isAdmin") === "true"; 
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;