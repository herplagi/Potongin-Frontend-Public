import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiXCircle, FiCheckCircle, FiTool } from 'react-icons/fi';

// Komponen Notifikasi Status Pendaftaran
const ApplicationStatus = ({ applications }) => (
    <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700">Status Pendaftaran Barbershop Anda</h2>
        {applications.map(app => (
            <div key={app.barbershop_id} className={`mt-3 p-4 rounded-lg flex items-start space-x-3 ${
                app.approval_status === 'pending' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                app.approval_status === 'rejected' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'
            }`}>
                {app.approval_status === 'pending' && <FiClock className="text-yellow-500 mt-1" />}
                {app.approval_status === 'rejected' && <FiXCircle className="text-red-500 mt-1" />}
                {app.approval_status === 'approved' && <FiCheckCircle className="text-green-500 mt-1" />}
                <div>
                    <p className="font-semibold">{app.name}</p>
                    {app.approval_status === 'rejected' && (
                        <>
                            <p className="text-sm text-red-700">Ditolak: {app.rejection_reason || "Tidak ada alasan spesifik."}</p>
                            <Link to={`/owner/barbershop/${app.barbershop_id}/edit`} className="text-sm font-semibold text-indigo-600 hover:underline">Perbaiki & Ajukan Ulang</Link>
                        </>
                    )}
                    {app.approval_status === 'pending' && <p className="text-sm text-yellow-700">Sedang direview oleh Admin.</p>}
                    {app.approval_status === 'approved' && <p className="text-sm text-green-700">Selamat! Barbershop Anda telah disetujui.</p>}
                </div>
            </div>
        ))}
    </div>
);

// Komponen Ajakan untuk Daftar
const RegisterCTA = () => (
    <div className="p-8 mt-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg text-white">
        <h2 className="text-2xl font-bold">Punya Bisnis Barbershop?</h2>
        <p className="mt-1 text-indigo-100">Daftarkan barbershop Anda untuk menjangkau lebih banyak pelanggan.</p>
        <Link to="/register-barbershop" className="inline-block px-6 py-2 mt-6 font-semibold bg-white text-indigo-600 rounded-md hover:bg-gray-100">
            Daftarkan Barbershop Baru
        </Link>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            const checkApplicationStatus = async () => {
                try {
                    const response = await api.get('/barbershops/my-application');
                    setApplications(response.data);
                } catch (error) {
                    if (error.response?.status !== 404) {
                        console.error("Gagal cek status aplikasi:", error);
                    }
                } finally {
                    setLoading(false);
                }
            };
            checkApplicationStatus();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Selamat Datang, {user?.name}!</h1>
            
            {user?.role === 'owner' && (
                <div className="p-6 mt-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-bold text-green-800">Panel Owner Aktif</h2>
                    <p className="mt-1 text-green-700">Anda sekarang dapat mengelola barbershop Anda.</p>
                    <Link to="/owner/my-barbershops" className="mt-4 inline-flex items-center px-4 py-2 font-semibold bg-green-600 text-white rounded-md hover:bg-green-700">
                        <FiTool className="mr-2"/> Masuk ke Panel Kelola Barbershop
                    </Link>
                </div>
            )}
            
            {applications.length > 0 && <ApplicationStatus applications={applications} />}

            {applications.length === 0 && user?.role === 'customer' && <RegisterCTA />}
        </div>
    );
};

export default DashboardPage;