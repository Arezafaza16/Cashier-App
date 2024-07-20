import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { loginInfo } = useContext(AuthContext);

    if (!loginInfo) {
        return <Navigate to="/sign-in" />;
    }

    if (role && loginInfo.role !== role) {
        return <Navigate to="/sign-in" />;
    }

    return children;
};

export default PrivateRoute;