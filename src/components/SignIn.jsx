import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getUserByEmail } from '../appwrite/api';

const SignIn = () => {
    const { loginInfo, login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (loginInfo) {
            if (loginInfo.role === 'kasir') {
                navigate('/');
            } else if (loginInfo.role === 'barista') {
                navigate('/barista');
            }
        }
    }, [loginInfo, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lakukan sesuatu dengan email dan password, misalnya kirim ke server
        const emailLogin = e.target.email.value
        const passwordLogin = e.target.password.value

        const user = await getUserByEmail(emailLogin, passwordLogin)

        if (user) {
            login(user);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Sign In</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;