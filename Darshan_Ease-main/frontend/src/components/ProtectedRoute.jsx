import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userInfo } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const location = useLocation();

  useEffect(() => {
    if (!userInfo) {
      showToast('Please sign in to access this page.', 'info');
    } else if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      showToast('Unauthorized access. Redirecting...', 'error');
    }
  }, [userInfo, allowedRoles, showToast]);

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
