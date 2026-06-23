/* eslint-disable react/prop-types */
import { Navigate } from 'react-router';
import useCurrent from '../hooks/auth/useCurrent';
import Loading from './Loading';

const Protected = ({ allowedRoles, children }) => {
    const {data, isLoading} = useCurrent()
    if (isLoading) return <Loading />;
    return allowedRoles.includes(data?.role) ? children : <Navigate to="/signin" />;
};

export default Protected;


 