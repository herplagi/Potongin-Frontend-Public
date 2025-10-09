import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiPlus, FiBarChart2 } from 'react-icons/fi';

// Komponen Kartu Aksi untuk navigasi yang lebih menarik
const ActionCard = ({ to, icon, title, children }) => (
    <Link to={to} className="block p-6 bg-white rounded-2xl shadow-md transition-all transform hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                {icon}
            </div>
            <h3 className="ml-4 text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="mt-3 text-gray-600">{children}</p>
    </Link>
);

const OwnerDashboardPage = () => {
    const { user } = useAuth();

    return (
        <div>
            {/* --- Bagian Header --- */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900">Dashboard Owner</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Selamat datang kembali, <span className="font-semibold text-indigo-600">{user?.name}!</span>
                </p>
            </div>

            {/* --- Bagian Aksi Cepat / Navigasi Utama --- */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700">Mulai dari Sini</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    
                    <ActionCard 
                        to="/owner/my-barbershops" 
                        icon={<FiHome size={24} />}
                        title="Barbershop Saya"
                    >
                        Lihat, kelola, dan periksa status semua barbershop yang Anda miliki.
                    </ActionCard>

                    <ActionCard 
                        to="/register-barbershop" 
                        icon={<FiPlus size={24} />}
                        title="Tambah Barbershop Baru"
                    >
                        Daftarkan cabang baru atau bisnis barbershop Anda yang lainnya di platform kami.
                    </ActionCard>
                    
                    {/* Kartu placeholder untuk fitur di masa depan */}
                    <div className="block p-6 bg-gray-50 rounded-2xl border border-dashed">
                        <div className="flex items-center">
                            <div className="p-3 bg-gray-200 text-gray-500 rounded-lg">
                                <FiBarChart2 size={24} />
                            </div>
                            <h3 className="ml-4 text-xl font-bold text-gray-400">Laporan & Analitik</h3>
                        </div>
                        <p className="mt-3 text-gray-400">Fitur ini akan segera hadir untuk membantu Anda memantau performa bisnis.</p>
                    </div>

                </div>
            </div>

            {/* Di sini nanti bisa ditambahkan ringkasan KPI agregat dari semua barbershop */}
        </div>
    );
};

export default OwnerDashboardPage;