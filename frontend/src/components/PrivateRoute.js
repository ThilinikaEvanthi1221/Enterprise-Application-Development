import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or their default dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
