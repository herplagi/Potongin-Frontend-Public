// src/pages/owner/ManageStaffPage.js
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiUsers } from 'react-icons/fi';

const ManageStaffPage = () => {
    // Ambil barbershopId dari URL parameter
    const { barbershopId } = useParams();

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: '', specialty: '' });

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            // Gunakan barbershopId dari URL
            const response = await api.get(`/barbershops/${barbershopId}/staff`);
            setStaffList(response.data);
        } catch (error) {
            toast.error("Gagal memuat data staf.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [barbershopId]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const openModal = (mode, staff = null) => {
        setModalMode(mode);
        setCurrentStaff(mode === 'edit' && staff ? staff : { name: '', specialty: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Endpoint dengan barbershopId
        const endpoint = modalMode === 'add' 
            ? `/barbershops/${barbershopId}/staff` 
            : `/barbershops/${barbershopId}/staff/${currentStaff.staff_id}`;
        
        const method = modalMode === 'add' ? 'post' : 'put';

        try {
            await api[method](endpoint, currentStaff);
            toast.success(`Staf berhasil di-${modalMode === 'add' ? 'tambahkan' : 'perbarui'}!`);
            fetchStaff();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (staffId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus staf ini?")) {
            try {
                await api.delete(`/barbershops/${barbershopId}/staff/${staffId}`);
                toast.success("Staf berhasil dihapus.");
                fetchStaff();
            } catch (error) {
                toast.error("Gagal menghapus staf.");
            }
        }
    };

    // Helper function untuk merender konten utama
    const renderContent = () => {
        if (loading) {
            return <p className="text-center mt-8 text-gray-500">Memuat data staf...</p>;
        }

        if (staffList.length === 0) {
            return (
                <div className="text-center mt-12 py-16 border-2 border-dashed rounded-lg">
                    <FiUsers className="mx-auto text-6xl text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">Belum Ada Staf Terdaftar</h3>
                    <p className="mt-2 text-gray-500">Tambahkan staf atau kapster pertama Anda untuk melayani pelanggan.</p>
                    <button
                        onClick={() => openModal('add')}
                        className="mt-6 flex items-center mx-auto px-5 py-2.5 text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus className="mr-2" /> Tambah Staf Pertama Anda
                    </button>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Staf</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spesialisasi</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staffList.map(staff => (
                            <tr key={staff.staff_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{staff.name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{staff.specialty || '-'}</td>
                                <td className="px-6 py-4 text-center text-lg">
                                    <div className="flex justify-center items-center space-x-4">
                                        <button
                                            onClick={() => openModal('edit', staff)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Edit"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(staff.staff_id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Hapus"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <Link
                to="/owner/my-barbershops"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
            >
                <FiArrowLeft className="mr-2" />
                Kembali ke Daftar Barbershop
            </Link>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Kelola Staf / Kapster</h1>
                {staffList.length > 0 && (
                    <button
                        onClick={() => openModal('add')}
                        className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow"
                    >
                        <FiPlus className="mr-2" /> Tambah Staf Baru
                    </button>
                )}
            </div>

            {renderContent()}

            {/* Modal untuk Tambah/Edit Staf */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
                                <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Tambah Staf Baru' : 'Edit Staf'}
                                </Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Nama Staf
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            value={currentStaff.name}
                                            onChange={handleChange}
                                            placeholder="Nama Lengkap Staf"
                                            required
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                                            Spesialisasi (Opsional)
                                        </label>
                                        <input
                                            id="specialty"
                                            name="specialty"
                                            value={currentStaff.specialty}
                                            onChange={handleChange}
                                            placeholder="Contoh: Ahli Pewarnaan, Expert Fade"
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                                        >
                                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ManageStaffPage;