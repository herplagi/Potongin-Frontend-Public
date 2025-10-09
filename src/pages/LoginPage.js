// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Login gagal. Periksa kembali email dan password Anda.');
        }
    };

    return (
        <div className="grid w-full h-screen grid-cols-1 lg:grid-cols-2">
            {/* Kolom Kiri: Form Login */}
            <div className="flex flex-col items-center justify-center px-4 py-12 bg-white sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-600">
                            Potong.in
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                                <div className="mt-1">
                                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1">
                                    <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Gambar */}
            <div className="hidden lg:block relative w-full h-full">
                <div className="absolute inset-0 bg-gray-800 opacity-25"></div>
                <img
                    className="object-cover w-full h-full"
                    src="https://images.pexels.com/photos/3944747/pexels-photo-3944747.jpeg"
                    alt="Barbershop"
                />
            </div>
        </div>
    );
};

export default LoginPage;