import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;