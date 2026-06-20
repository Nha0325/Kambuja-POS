import { Navigate } from 'react-router';
import useCurrent from '../hooks/auth/useCurrent';
import Loading from './Loading';

// eslint-disable-next-line react/prop-types
function AuthRedirect({children}) {
    const { data, isLoading } = useCurrent();
    if (isLoading) return <Loading />;

    if (data) {
         if (data?.role === "admin" || data?.role === "super") {
            return <Navigate to="/" replace />;
        }
        else if (data?.role === "cashier") {
            return <Navigate to="/cashier/pos" replace />;
        }
        else return <Navigate to="/unauthorized" replace />;
    }
    return children;
}

export default AuthRedirect
