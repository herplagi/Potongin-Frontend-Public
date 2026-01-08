// src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { resetPassword } from '../services/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError('Token tidak valid. Silakan gunakan link dari email Anda.');
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validasi password
        if (newPassword.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama.');
            return;
        }

        if (!token) {
            setError('Token tidak valid.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, newPassword);
            setSuccess('Password berhasil direset. Silakan login.');
            
            // Redirect ke login setelah 2 detik
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response?.status === 400) {
                setError('Token invalid atau sudah kadaluarsa. Silakan minta link reset password baru.');
            } else if (err.response?.status === 404) {
                setError('Token tidak ditemukan. Silakan minta link reset password baru.');
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid w-full h-screen grid-cols-1 lg:grid-cols-2">
            {/* Kolom Kiri: Form */}
            <div className="flex flex-col items-center justify-center px-4 py-12 bg-white sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-600">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Masukkan password baru Anda.
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                                    {success}
                                </div>
                            )}
                            
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    Password Baru
                                </label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FiLock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="newPassword" 
                                        name="newPassword" 
                                        type="password" 
                                        autoComplete="new-password" 
                                        required 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="block w-full py-2 pl-10 pr-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FiLock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        type="password" 
                                        autoComplete="new-password" 
                                        required 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        className="block w-full py-2 pl-10 pr-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Ulangi password baru"
                                    />
                                </div>
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading || !token}
                                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Mereset Password...' : 'Reset Password'}
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

export default ResetPasswordPage;
