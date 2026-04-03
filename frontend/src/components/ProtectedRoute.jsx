import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole'); // buyer | seller | admin

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin-home" replace />;
    if (role === 'seller') return <Navigate to="/seller-home" replace />;
    return <Navigate to="/buyer-home" replace />;
  }

  return children;
};

export default ProtectedRoute;
