import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiUsers, FiScissors, FiBarChart2, FiTrash2, FiX } from 'react-icons/fi';

// Modal Konfirmasi Hapus
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, barbershopName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FiX size={24} />
                </button>

                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                    <FiTrash2 className="text-red-600" size={32} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Hapus Barbershop?
                </h3>
                
                <p className="text-gray-600 text-center mb-1">
                    Apakah Anda yakin ingin menghapus
                </p>
                <p className="text-gray-900 font-semibold text-center mb-4">
                    "{barbershopName}"?
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Peringatan:</span> Tindakan ini tidak dapat dibatalkan. 
                        Semua data termasuk layanan, staf, dan riwayat booking akan dihapus permanen.
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponen Tampilan jika owner belum punya barbershop
const NotRegisteredView = () => (
    <div className="text-center max-w-3xl mx-auto mt-10 p-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-white">Anda Belum Memiliki Barbershop</h1>
        <p className="mt-4 text-lg text-indigo-100">Jangkau ribuan pelanggan baru dengan mendaftarkan barbershop Anda.</p>
        <Link to="/register-barbershop" className="inline-block px-8 py-3 mt-8 text-lg font-bold text-indigo-600 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105">
            Daftarkan Barbershop Pertama Anda
        </Link>
    </div>
);

// Komponen untuk setiap item barbershop
const BarbershopListItem = ({ shop, onResubmit, onDelete }) => {
    const getStatusBadge = () => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
        switch (shop.approval_status) {
            case 'approved': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Disetujui</span>;
            case 'rejected': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Ditolak</span>;
            case 'pending': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
            default: return null;
        }
    };

    const getActionButtons = () => {
        switch (shop.approval_status) {
            case 'approved':
                return (
                    <div className="flex flex-wrap gap-2">
                        <Link to={`/owner/barbershop/${shop.barbershop_id}/dashboard`} className="flex items-center px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700" title="Dashboard & KPI">
                            <FiBarChart2 /> <span className="hidden sm:inline ml-2">Dashboard</span>
                        </Link>
                        <Link to={`/owner/barbershop/${shop.barbershop_id}/services`} className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700" title="Kelola Layanan">
                            <FiScissors /> <span className="hidden sm:inline ml-2">Layanan</span>
                        </Link>
                        <Link to={`/owner/barbershop/${shop.barbershop_id}/staff`} className="flex items-center px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-800" title="Kelola Staf">
                            <FiUsers /> <span className="hidden sm:inline ml-2">Staf</span>
                        </Link>
                        <button 
                            onClick={() => onDelete(shop)} 
                            className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700" 
                            title="Hapus Barbershop"
                        >
                            <FiTrash2 /> <span className="hidden sm:inline ml-2">Hapus</span>
                        </button>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex gap-2">
                        <Link to={`/owner/barbershop/${shop.barbershop_id}/edit`} className="px-3 py-1 text-sm text-white bg-yellow-600 rounded-md hover:bg-yellow-700">
                            Perbaiki
                        </Link>
                        <button 
                            onClick={() => onDelete(shop)} 
                            className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700" 
                            title="Hapus Barbershop"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                );
            case 'pending':
                return (
                    <button 
                        onClick={() => onDelete(shop)} 
                        className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700" 
                        title="Hapus Barbershop"
                    >
                        <FiTrash2 /> <span className="hidden sm:inline ml-2">Hapus</span>
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="font-bold text-lg text-gray-800">{shop.name}</p>
                <p className="text-sm text-gray-500">{shop.address}, {shop.city}</p>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                {getStatusBadge()}
                {getActionButtons()}
            </div>
        </div>
    );
};

// Komponen Halaman Utama
const MyBarbershopsPage = () => {
    const [barbershops, setBarbershops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, barbershop: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchMyBarbershops = useCallback(async () => {
        try {
            const response = await api.get('/barbershops/my-barbershops');
            setBarbershops(response.data);
        } catch (err) {
            if (err.response?.status !== 404) {
                toast.error("Gagal memuat data barbershop Anda.");
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyBarbershops();
    }, [fetchMyBarbershops]);

    const handleResubmit = async (barbershopId) => {
        if (window.confirm("Apakah Anda yakin ingin mengajukan ulang pendaftaran untuk barbershop ini?")) {
            try {
                await api.patch(`/barbershops/${barbershopId}/resubmit`);
                toast.success("Pendaftaran berhasil diajukan ulang.");
                fetchMyBarbershops();
            } catch (err) {
                toast.error('Gagal mengajukan ulang. Silakan coba lagi.');
            }
        }
    };

    const handleDeleteClick = (barbershop) => {
        setDeleteModal({ isOpen: true, barbershop });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.barbershop) return;

        setIsDeleting(true);
        try {
            await api.delete(`/barbershops/${deleteModal.barbershop.barbershop_id}`);
            toast.success(`Barbershop "${deleteModal.barbershop.name}" berhasil dihapus.`);
            setDeleteModal({ isOpen: false, barbershop: null });
            fetchMyBarbershops();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus barbershop. Silakan coba lagi.');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, barbershop: null });
    };

    if (loading) return <div className="p-8 text-center">Memuat barbershop Anda...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Barbershop Saya</h1>
                    <p className="mt-1 text-gray-600">Lihat dan kelola semua barbershop yang Anda miliki.</p>
                </div>
                <Link to="/register-barbershop" className="flex items-center px-4 py-2 mt-4 sm:mt-0 text-white bg-green-600 rounded-md hover:bg-green-700">
                    <FiPlus className="mr-2" /> Tambah Barbershop Baru
                </Link>
            </div>

            {barbershops.length === 0 ? (
                <NotRegisteredView />
            ) : (
                <div className="space-y-4">
                    {barbershops.map(shop => (
                        <BarbershopListItem 
                            key={shop.barbershop_id} 
                            shop={shop} 
                            onResubmit={handleResubmit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                barbershopName={deleteModal.barbershop?.name || ''}
            />

            {isDeleting && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Menghapus barbershop...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBarbershopsPage;