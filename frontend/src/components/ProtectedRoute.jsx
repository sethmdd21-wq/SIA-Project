import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login page, but maybe pass a message in state or search params
    return <Navigate to="/login" replace state={{ message: 'Please log in to access this page.' }} />;
  }

  return children;
};

export default ProtectedRoute;
