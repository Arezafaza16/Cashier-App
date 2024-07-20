import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loginInfo, setLoginInfo] = useState(() => {
        const storedLoginInfo = sessionStorage.getItem('loginInfo');
        return storedLoginInfo ? JSON.parse(storedLoginInfo) : null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        const storedLoginInfo = sessionStorage.getItem('loginInfo');
        if (storedLoginInfo) {
            setLoginInfo(JSON.parse(storedLoginInfo));
        }
    }, []);

    useEffect(() => {
        if (!loginInfo) {
            navigate('/sign-in');
        }
    }, [loginInfo, navigate]);

    const login = (user) => {
        const loginInfo = {
            email: user.email,
            role: user.role,
        };
        sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        setLoginInfo(loginInfo);

        if (user.role === 'kasir') {
            navigate('/');
        } else if (user.role === 'barista') {
            navigate('/barista');
        }
    };

    const logout = () => {
        sessionStorage.removeItem('loginInfo');
        setLoginInfo(null);
    };

    return (
        <AuthContext.Provider value={{ loginInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;