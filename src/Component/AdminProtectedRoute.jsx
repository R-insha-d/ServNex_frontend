import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  const userStr = localStorage.getItem("user");
  
  if (!token || !userStr) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    console.log("Admin Check - User Role:", user?.role, "Staff:", user?.is_staff, "Superuser:", user?.is_superuser);
    
    // Check if user is staff or superuser
    if (user && (user.is_staff || user.is_superuser)) {
        return children;
    } else {
        console.warn("User is not an admin. Redirecting to home.");
        return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Error parsing user data in AdminProtectedRoute:", error);
    return <Navigate to="/auth" replace />;
  }
};

export default AdminProtectedRoute;
