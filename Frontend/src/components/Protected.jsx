import { Navigate } from 'react-router';
import useCurrent from '../hooks/auth/useCurrent';
import Loading from './Loading';
import { normalizeRole } from '../utils/role';

const Protected = ({ allowedRoles, children }) => {
    const {data, isLoading} = useCurrent()
    if (isLoading) return <Loading />;
    if (!data) return <Navigate to="/login" replace />;

    const role = normalizeRole(data.role)
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole)
    return normalizedAllowedRoles.includes(role)
      ? children
      : <Navigate to="/unauthorized" replace />;
};

export default Protected;


 
