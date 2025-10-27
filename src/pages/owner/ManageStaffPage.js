// src/pages/owner/ManageStaffPage.js
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiUsers, FiPower, FiUpload } from 'react-icons/fi';

const ManageStaffPage = () => {
    const { barbershopId } = useParams();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: '', specialty: '', photo: null });
    const [photoPreview, setPhotoPreview] = useState(null);

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
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
        if (mode === 'edit' && staff) {
            setCurrentStaff({ 
                ...staff, 
                photo: null // Reset photo untuk edit
            });
            // Set preview dari foto yang sudah ada
            if (staff.picture) {
                setPhotoPreview(`http://localhost:5000${staff.picture}`);
            }
        } else {
            setCurrentStaff({ name: '', specialty: '', photo: null });
            setPhotoPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPhotoPreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStaff(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                toast.error('File harus berupa gambar (JPG, PNG)');
                return;
            }
            // Validasi ukuran (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 2MB');
                return;
            }
            setCurrentStaff(prev => ({ ...prev, photo: file }));
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', currentStaff.name);
        formData.append('specialty', currentStaff.specialty || '');
        if (currentStaff.photo) {
            formData.append('photo', currentStaff.photo);
        }

        const endpoint = modalMode === 'add' 
            ? `/barbershops/${barbershopId}/staff` 
            : `/barbershops/${barbershopId}/staff/${currentStaff.staff_id}`;
        
        const method = modalMode === 'add' ? 'post' : 'put';

        try {
            await api[method](endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Staf berhasil di-${modalMode === 'add' ? 'tambahkan' : 'perbarui'}!`);
            fetchStaff();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (staffId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const message = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
        
        if (window.confirm(`Apakah Anda yakin ingin ${message} staf ini?`)) {
            try {
                await api.patch(`/barbershops/${barbershopId}/staff/${staffId}/${action}`);
                toast.success(`Staf berhasil di-${message}.`);
                fetchStaff();
            } catch (error) {
                toast.error(`Gagal ${message} staf.`);
            }
        }
    };

    const handleDelete = async (staffId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus staf ini secara permanen?")) {
            try {
                await api.delete(`/barbershops/${barbershopId}/staff/${staffId}`);
                toast.success("Staf berhasil dihapus.");
                fetchStaff();
            } catch (error) {
                toast.error("Gagal menghapus staf.");
            }
        }
    };

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Staf</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spesialisasi</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staffList.map(staff => (
                            <tr key={staff.staff_id} className={`hover:bg-gray-50 transition-colors ${!staff.is_active && 'opacity-60 bg-gray-100'}`}>
                                <td className="px-6 py-4">
                                    {staff.picture ? (
                                        <img 
                                            src={`http://localhost:5000${staff.picture}`}
                                            alt={staff.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FiUsers className="text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{staff.name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{staff.specialty || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        staff.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {staff.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-lg">
                                    <div className="flex justify-center items-center space-x-3">
                                        <button
                                            onClick={() => openModal('edit', staff)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Edit"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(staff.staff_id, staff.is_active)}
                                            className={staff.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                                            title={staff.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        >
                                            <FiPower />
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
                                    {/* Preview Foto */}
                                    <div className="flex justify-center">
                                        {photoPreview ? (
                                            <img 
                                                src={photoPreview} 
                                                alt="Preview" 
                                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                                                <FiUsers className="text-6xl text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Foto */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto Staf (Opsional)
                                        </label>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                                                </div>
                                                <input 
                                                    id="photo-upload" 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden" 
                                                />
                                            </label>
                                        </div>
                                    </div>

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