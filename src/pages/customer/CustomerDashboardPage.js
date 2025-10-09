// src/pages/customer/CustomerDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiXCircle } from 'react-icons/fi';

const NotRegisteredView = () => (
    <div className="text-center max-w-3xl mx-auto mt-10 p-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-white">Satu Langkah Lagi untuk Berkembang</h1>
        <p className="mt-4 text-lg text-indigo-100">Jangkau ribuan pelanggan baru setiap hari.</p>
        <Link to="/register-barbershop" className="inline-block px-8 py-3 mt-8 text-lg font-bold text-indigo-600 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105">
            Daftarkan Barbershop Saya Sekarang!
        </Link>
    </div>
);

// Tampilan jika pendaftaran PENDING
const PendingView = ({ shopName }) => (
    <div className="max-w-2xl mx-auto mt-10 p-8 text-center bg-yellow-50 border-2 border-yellow-300 rounded-2xl shadow-md">
        <FiClock className="mx-auto text-5xl text-yellow-500" />
        <h2 className="mt-4 text-2xl font-bold text-yellow-800">Pendaftaran "{shopName}" Sedang Direview</h2>
        <p className="mt-2 text-yellow-700">Tim Admin sedang memeriksa data Anda. Mohon bersabar.</p>
    </div>
);

// Tampilan jika pendaftaran DITOLAK
const RejectedView = ({ shop }) => (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-red-50 border-2 border-red-300 rounded-2xl shadow-md">
        <FiXCircle className="mx-auto text-5xl text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-red-800">Pendaftaran "{shop.name}" Ditolak</h2>
        <div className="p-4 mt-6 text-left bg-white border border-red-200 rounded-md">
            <p className="font-semibold text-gray-800">Alasan dari Admin:</p>
            <p className="mt-1 italic text-gray-600">"{shop.rejection_reason || "Tidak ada alasan spesifik."}"</p>
        </div>
        <div className="mt-6 text-center">
             {/* Di sini bisa ditambahkan tombol untuk Edit & Resubmit */}
             <p className="text-sm text-gray-600">Silakan perbaiki data Anda lalu ajukan kembali.</p>
        </div>
    </div>
);

const CustomerDashboardPage = () => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkApplicationStatus = async () => {
            try {
                const response = await api.get('/barbershops/my-application');
                setApplication(response.data);
            } catch (error) {
                // Error 404 berarti belum ada aplikasi, ini normal, jadi tidak perlu set error
                if (error.response?.status !== 404) {
                    console.error("Gagal cek status aplikasi:", error);
                }
            } finally {
                setLoading(false);
            }
        };
        checkApplicationStatus();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!application) {
        return <NotRegisteredView />;
    }

    if (application.approval_status === 'pending') {
        return <PendingView shopName={application.name} />;
    }
    
    if (application.approval_status === 'rejected') {
        return <RejectedView shop={application} />;
    }

    // Jika statusnya approved, HomeRedirect akan otomatis mengarahkan ke /owner/dashboard
    // Tampilan ini hanya fallback
    return <div>Memuat data owner...</div>;
};

export default CustomerDashboardPage;