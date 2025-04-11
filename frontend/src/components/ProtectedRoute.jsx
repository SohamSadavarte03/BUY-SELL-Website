import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from './context/authcontext';
import { useAuth } from "../context/authcontext";


export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
export default ProtectedRoute;