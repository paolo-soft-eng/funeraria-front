import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { EmailContext } from './EmailContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { email } = useContext(EmailContext);
  
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  // If no user role is found, redirect to auth
  if (!userRole) {
    return <Navigate to="/gomez/auth" replace />;
  }

  // Check if user's role is allowed to access this route
  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role
    switch (userRole) {
      case 'client':
        return <Navigate to="/gomez/dashboard-client" replace />;
      case 'admin':
        return <Navigate to="/gomez/dashboard-admin/home" replace />;
      case 'superadmin':
        return <Navigate to="/gomez/super-admin" replace />;
      default:
        return <Navigate to="/gomez/auth" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 