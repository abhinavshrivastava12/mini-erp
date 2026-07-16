import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a route element and only renders it if the current user's role is
// in `allowedRoles`. This backs up the dynamic sidebar (which only shows
// links for the user's role) by also blocking direct URL navigation to a
// module the user's role shouldn't see. The backend independently enforces
// this via RBAC middleware on every API call, so this is a UX layer, not
// the security boundary.
export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role_name)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
