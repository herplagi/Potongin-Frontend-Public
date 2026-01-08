// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { forgotPassword } from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await forgotPassword(email);
            setSuccess('Email reset password telah dikirim. Silakan cek inbox Anda.');
            setEmail('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Email tidak terdaftar dalam sistem.');
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
                            Lupa Password?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Alamat Email
                                </label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FiMail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        autoComplete="email" 
                                        required 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="block w-full py-2 pl-10 pr-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="nama@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    <FiArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Login
                                </Link>
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

export default ForgotPasswordPage;
