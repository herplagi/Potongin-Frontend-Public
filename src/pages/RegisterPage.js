import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await registerUser(formData);
            setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-center">Buat Akun Baru</h2>
                <p className="text-sm text-center text-gray-600">Sudah punya akun? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Login</Link></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}
                    {success && <div className="p-3 text-green-700 bg-green-100 rounded">{success}</div>}
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="Alamat Email" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} placeholder="Nomor Telepon" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-3 py-2 border rounded-md"/>
                    <button type="submit" className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Daftar</button>
                </form>
            </div>
        </div>
    );
};
export default RegisterPage;