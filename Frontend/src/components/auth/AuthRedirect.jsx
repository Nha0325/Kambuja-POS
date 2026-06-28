import { Navigate } from 'react-router';
import useCurrent from '../../hooks/auth/useCurrent';
import Loading from '../ui/Loading';
import { homeForRole } from '../../utils/helpers/role';

function AuthRedirect({children}) {
    const { data, isLoading } = useCurrent();
    if (isLoading) return <Loading />;

    if (data) return <Navigate to={homeForRole(data.role)} replace />;
    return children;
}

export default AuthRedirect
