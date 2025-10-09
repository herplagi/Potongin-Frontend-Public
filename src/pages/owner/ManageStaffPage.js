// src/pages/owner/ManageStaffPage.js
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const ManageStaffPage = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentStaff, setCurrentStaff] = useState({ name: '', specialty: '' });

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/my-staff');
            setStaffList(response.data);
        } catch (error) {
            toast.error("Gagal memuat data staf.");
        } finally {
            setLoading(false);
        }
    }, []);

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
        const endpoint = modalMode === 'add' ? '/my-staff' : `/my-staff/${currentStaff.staff_id}`;
        const method = modalMode === 'add' ? 'post' : 'put';

        try {
            await api[method](endpoint, currentStaff);
            toast.success(`Staf berhasil di-${modalMode === 'add' ? 'tambahkan' : 'perbarui'}!`);
            fetchStaff();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan.");
        }
    };

    const handleDelete = async (staffId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus staf ini?")) {
            try {
                await api.delete(`/my-staff/${staffId}`);
                toast.success("Staf berhasil dihapus.");
                fetchStaff();
            } catch (error) {
                toast.error("Gagal menghapus staf.");
            }
        }
    };

    if (loading) return <p>Loading staf...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Kelola Staf / Kapster</h1>
                <button onClick={() => openModal('add')} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <FiPlus className="mr-2"/> Tambah Staf Baru
                </button>
            </div>

            {/* Tabel Staf */}
            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Nama Staf</th>
                            <th className="px-6 py-3 text-left">Spesialisasi</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staffList.map(staff => (
                            <tr key={staff.staff_id}>
                                <td className="px-6 py-4 font-medium">{staff.name}</td>
                                <td className="px-6 py-4">{staff.specialty || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => openModal('edit', staff)} className="text-blue-600 hover:text-blue-800 mr-4"><FiEdit /></button>
                                    <button onClick={() => handleDelete(staff.staff_id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal untuk Tambah/Edit Staf */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                     <div className="fixed inset-0 bg-black bg-opacity-25" />
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
                                <Dialog.Title as="h3" className="text-xl font-bold">{modalMode === 'add' ? 'Tambah Staf Baru' : 'Edit Staf'}</Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <input name="name" value={currentStaff.name} onChange={handleChange} placeholder="Nama Staf" required className="w-full p-2 border rounded-md" />
                                    <input name="specialty" value={currentStaff.specialty} onChange={handleChange} placeholder="Spesialisasi (contoh: Ahli Pewarnaan)" className="w-full p-2 border rounded-md" />
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-md">Batal</button>
                                        <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md">Simpan</button>
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