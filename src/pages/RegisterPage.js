// src/pages/owner/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [errors, setErrors]       = useState({});
    const [serverError, setServerError] = useState('');
    const [success, setSuccess]     = useState('');
    const navigate = useNavigate();

    // ── Validasi per field ──
    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                return value.trim().length < 2 ? 'Nama minimal 2 karakter' : '';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Format email tidak valid';
            case 'phoneNumber':
                if (!/^\d+$/.test(value))    return 'Hanya boleh berisi angka';
                if (!value.startsWith('08')) return 'Harus dimulai dengan 08';
                if (value.length < 10)       return 'Nomor terlalu pendek (min. 10 digit)';
                if (value.length > 13)       return 'Nomor terlalu panjang (maks. 13 digit)';
                return '';
            case 'password':
                if (value.length < 8)  return 'Password minimal 8 karakter';
                if (value.length > 32) return 'Password maksimal 32 karakter';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Buang karakter non-angka langsung untuk nomor HP
        const sanitized = name === 'phoneNumber' ? value.replace(/\D/g, '') : value;
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, sanitized) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccess('');

        // Validasi semua field sebelum kirim ke server
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const msg = validateField(key, formData[key]);
            if (msg) newErrors[key] = msg;
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await registerUser(formData);
            setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Registrasi gagal.');
        }
    };

    // Helper class input — border merah jika ada error
    const inputClass = (field) =>
        `block w-full px-4 py-3 text-sm text-white placeholder-slate-500 bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
            errors[field] ? 'border-red-500/70' : 'border-slate-700'
        }`;

    return (
        <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2 bg-slate-900">

            {/* ── Kolom Kiri: Form Register ── */}
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
                        <h1 className="text-3xl font-bold text-white">Buat akun baru</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Login di sini
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Server error */}
                        {serverError && (
                            <div className="flex items-start gap-2 p-3 text-sm text-red-300 bg-red-900/40 border border-red-700/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {serverError}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="flex items-start gap-2 p-3 text-sm text-green-300 bg-green-900/40 border border-green-700/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                {success}
                            </div>
                        )}

                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                                Nama Lengkap
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Masukkan nama lengkap"
                                className={inputClass('name')}
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                                Alamat Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nama@email.com"
                                className={inputClass('email')}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Nomor Telepon */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                                Nomor Telepon
                            </label>
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="08xxxxxxxxxx"
                                maxLength={13}
                                inputMode="numeric"
                                className={inputClass('phoneNumber')}
                            />
                            {errors.phoneNumber
                                ? <p className="mt-1.5 text-xs text-red-400">{errors.phoneNumber}</p>
                                : <p className="mt-1.5 text-xs text-slate-500">Hanya angka, dimulai 08, 10–13 digit</p>
                            }
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Password
                                </label>
                                {formData.password.length > 0 && (
                                    <span className="text-xs text-slate-500">{formData.password.length}/32</span>
                                )}
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 8 karakter"
                                maxLength={32}
                                className={inputClass('password')}
                            />

                            {/* Password strength bar */}
                            {formData.password.length > 0 && (() => {
                                const len    = formData.password.length;
                                const level  = len < 8 ? 0 : len < 12 ? 1 : len < 20 ? 2 : 3;
                                const bars   = ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'];
                                const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                                const labels = ['Terlalu pendek', 'Lemah', 'Cukup kuat', 'Kuat'];
                                return (
                                    <div className="mt-2">
                                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-1 rounded-full transition-all duration-300 ${bars[level]} ${colors[level]}`} />
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">{labels[level]}</p>
                                    </div>
                                );
                            })()}

                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Tombol submit */}
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center px-4 py-3 mt-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all active:scale-[0.98]"
                        >
                            Daftar Sekarang
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Kolom Kanan: Visual + Social Proof ── */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-800 relative overflow-hidden">

                {/* Dekorasi latar belakang */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full" />
                    <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/5 rounded-full" />
                </div>

                {/* Foto barbershop */}
                <div className="relative  overflow-hidden flex-1 filter grayscale(80%) brightness-75">
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

export default RegisterPage;