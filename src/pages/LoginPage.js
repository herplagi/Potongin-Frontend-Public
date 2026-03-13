// src/pages/owner/LoginPage.js
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

            // Ambil token dari localStorage untuk decode role
            const token = localStorage.getItem('token');
            if (token) {
                const { jwtDecode } = await import('jwt-decode');
                const decodedUser = jwtDecode(token);

                // Redirect berdasarkan role
                if (decodedUser.role === 'owner') {
                    navigate('/owner/my-barbershops');
                } else if (decodedUser.role === 'customer') {
                    navigate('/dashboard');
                } else if (decodedUser.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard'); // default fallback
                }
            }
        } catch (err) {
            setError('Login gagal. Periksa kembali email dan password Anda.');
        }
    };

    return (
        <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2 bg-slate-900">

            {/* ── Kolom Kiri: Form Login ── */}
            <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
                <div className="w-full max-w-sm">

                    {/* Brand mark + nama */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-xl flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                                <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                                <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Potong.in</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Selamat datang</h1>
                        <p className="mt-3 text-sm text-slate-400">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 p-3 text-sm text-red-300 bg-red-900/40 border border-red-700/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                                Alamat Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="block w-full px-4 py-3 text-sm text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Lupa Password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full px-4 py-3 text-sm text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Tombol submit */}
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all active:scale-[0.98]"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Kolom Kanan: Visual + Value Proposition ── */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-800 relative overflow-hidden">

                {/* Dekorasi latar belakang */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full" />
                    <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/5 rounded-full" />
                </div>

                {/* Foto barbershop */}
                <div className="relative overflow-hidden flex-1 filter grayscale(80%) brightness-75">
                    <img
                        src="https://images.pexels.com/photos/3944747/pexels-photo-3944747.jpeg"
                        alt="Barbershop"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;