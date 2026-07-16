import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem('erp_token');

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
