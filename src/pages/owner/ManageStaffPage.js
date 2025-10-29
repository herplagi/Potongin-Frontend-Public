// src/pages/owner/ManageStaffPage.js - UPDATED WITH CONFLICT HANDLING
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiUsers, FiPower, FiUpload, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const ManageStaffPage = () => {
    const { barbershopId } = useParams();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStaff, setCurrentStaff] = useState({ name: '', specialty: '', photo: null });
    const [photoPreview, setPhotoPreview] = useState(null);
    
    // ✅ State untuk konflik modal
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [staffToDeactivate, setStaffToDeactivate] = useState(null);
    
    // ✅ State untuk reassign modal
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedNewStaff, setSelectedNewStaff] = useState('');

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
                photo: null
            });
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
            if (!file.type.startsWith('image/')) {
                toast.error('File harus berupa gambar (JPG, PNG)');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 2MB');
                return;
            }
            setCurrentStaff(prev => ({ ...prev, photo: file }));
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

    // ✅ UPDATED: Toggle active dengan cek konflik
    const handleToggleActive = async (staffId, currentStatus) => {
        if (currentStatus) {
            // Menonaktifkan - cek konflik dulu
            const staff = staffList.find(s => s.staff_id === staffId);
            try {
                const response = await api.patch(
                    `/barbershops/${barbershopId}/staff/${staffId}/deactivate`,
                    { force_update: false }
                );
                
                // Berhasil tanpa konflik
                toast.success("Staf berhasil dinonaktifkan.");
                fetchStaff();
            } catch (error) {
                if (error.response?.status === 409) {
                    // Ada konflik booking
                    setConflictData(error.response.data);
                    setStaffToDeactivate(staff);
                    setShowConflictModal(true);
                } else {
                    toast.error("Gagal menonaktifkan staf.");
                }
            }
        } else {
            // Mengaktifkan kembali - langsung
            try {
                await api.patch(`/barbershops/${barbershopId}/staff/${staffId}/activate`);
                toast.success("Staf berhasil diaktifkan kembali.");
                fetchStaff();
            } catch (error) {
                toast.error("Gagal mengaktifkan staf.");
            }
        }
    };

    // ✅ Force deactivate setelah konfirmasi
    const handleForceDeactivate = async () => {
        if (!staffToDeactivate) return;
        
        try {
            await api.patch(
                `/barbershops/${barbershopId}/staff/${staffToDeactivate.staff_id}/deactivate`,
                { force_update: true }
            );
            toast.success("Staf berhasil dinonaktifkan.");
            toast.warning("Jangan lupa hubungi customer dan reassign booking!", { autoClose: 8000 });
            setShowConflictModal(false);
            setStaffToDeactivate(null);
            fetchStaff();
        } catch (error) {
            toast.error("Gagal menonaktifkan staf.");
        }
    };

    // ✅ Buka modal reassign
    const handleOpenReassign = () => {
        setShowConflictModal(false);
        setShowReassignModal(true);
    };

    // ✅ Handle reassign bookings
    const handleReassignBookings = async () => {
        if (!selectedNewStaff || !staffToDeactivate) {
            toast.error('Pilih staff pengganti terlebih dahulu');
            return;
        }

        try {
            const response = await api.post(
                `/barbershops/${barbershopId}/staff/${staffToDeactivate.staff_id}/reassign`,
                { new_staff_id: selectedNewStaff }
            );

            toast.success(response.data.message);
            
            // Setelah reassign berhasil, nonaktifkan staff
            await api.patch(
                `/barbershops/${barbershopId}/staff/${staffToDeactivate.staff_id}/deactivate`,
                { force_update: true }
            );

            setShowReassignModal(false);
            setShowConflictModal(false);
            setStaffToDeactivate(null);
            setSelectedNewStaff('');
            fetchStaff();
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error('Staff pengganti memiliki jadwal konflik. Pilih staff lain atau hubungi customer.');
            } else {
                toast.error(error.response?.data?.message || 'Gagal reassign booking');
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
                if (error.response?.status === 400) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Gagal menghapus staf.");
                }
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

    // Active staff untuk reassign (exclude yang sedang dinonaktifkan)
    const activeStaffForReassign = staffList.filter(
        s => s.is_active && s.staff_id !== staffToDeactivate?.staff_id
    );

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

            {/* Modal Add/Edit Staff (existing code remains same) */}
            <Transition appear show={isModalOpen} as={Fragment}>
                {/* ... existing modal code ... */}
            </Transition>

            {/* ✅ NEW: Modal Konflik Booking */}
            <Transition appear show={showConflictModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowConflictModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <div className="flex items-center space-x-3 mb-4">
                                    <FiAlertTriangle className="text-4xl text-amber-500" />
                                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                                        Staff Memiliki Booking Aktif!
                                    </Dialog.Title>
                                </div>

                                {conflictData && staffToDeactivate && (
                                    <>
                                        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                                            <p className="text-sm text-amber-800">
                                                <strong>{staffToDeactivate.name}</strong> memiliki <strong>{conflictData.affected_bookings?.count} booking</strong> yang akan datang.
                                            </p>
                                            <p className="text-sm text-amber-700 mt-2">
                                                {conflictData.affected_bookings?.warning}
                                            </p>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto mb-6">
                                            <h3 className="font-semibold text-gray-800 mb-3">Detail Booking:</h3>
                                            <div className="space-y-3">
                                                {conflictData.affected_bookings?.details?.map((detail, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{detail.customer_name}</p>
                                                                <p className="text-sm text-gray-600">{detail.customer_phone}</p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                detail.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {detail.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-700 space-y-1">
                                                            <p><strong>Layanan:</strong> {detail.service_name}</p>
                                                            <p><strong>Tanggal:</strong> {detail.booking_date}</p>
                                                            <p><strong>Waktu:</strong> {detail.booking_time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                            <h4 className="font-semibold text-blue-800 mb-2">Pilihan Anda:</h4>
                                            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                                                <li><strong>Reassign Otomatis:</strong> Pindahkan semua booking ke staff lain (direkomendasikan)</li>
                                                <li><strong>Manual:</strong> Hubungi customer satu per satu untuk reschedule/cancel</li>
                                            </ol>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowConflictModal(false)}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                    >
                                        Batal
                                    </button>
                                    {activeStaffForReassign.length > 0 && (
                                        <button
                                            onClick={handleOpenReassign}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
                                        >
                                            <FiRefreshCw className="mr-2" />
                                            Reassign ke Staff Lain
                                        </button>
                                    )}
                                    <button
                                        onClick={handleForceDeactivate}
                                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                                    >
                                        Nonaktifkan & Saya Akan Hubungi Customer
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* ✅ NEW: Modal Reassign */}
            <Transition appear show={showReassignModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowReassignModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
                                    Pilih Staff Pengganti
                                </Dialog.Title>

                                {activeStaffForReassign.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FiUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                                        <p className="text-gray-600">Tidak ada staff aktif lain yang tersedia untuk reassign.</p>
                                        <button
                                            onClick={() => {
                                                setShowReassignModal(false);
                                                setShowConflictModal(true);
                                            }}
                                            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                        >
                                            Kembali
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Semua booking dari <strong>{staffToDeactivate?.name}</strong> akan dipindahkan ke staff yang Anda pilih:
                                        </p>

                                        <div className="space-y-2 mb-6">
                                            {activeStaffForReassign.map(staff => (
                                                <label
                                                    key={staff.staff_id}
                                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                        selectedNewStaff === staff.staff_id
                                                            ? 'border-indigo-600 bg-indigo-50'
                                                            : 'border-gray-200 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="newStaff"
                                                        value={staff.staff_id}
                                                        checked={selectedNewStaff === staff.staff_id}
                                                        onChange={(e) => setSelectedNewStaff(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex items-center space-x-3">
                                                        {staff.picture ? (
                                                            <img
                                                                src={`http://localhost:5000${staff.picture}`}
                                                                alt={staff.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <FiUsers className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{staff.name}</p>
                                                            {staff.specialty && (
                                                                <p className="text-xs text-gray-500">{staff.specialty}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-4">
                                            <p className="text-xs text-amber-700">
                                                ⚠️ Sistem akan mengecek konflik jadwal. Jika staff pengganti memiliki booking pada waktu yang sama, reassign akan gagal dan Anda perlu memilih staff lain.
                                            </p>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => {
                                                    setShowReassignModal(false);
                                                    setShowConflictModal(true);
                                                }}
                                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={handleReassignBookings}
                                                disabled={!selectedNewStaff}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center"
                                            >
                                                <FiRefreshCw className="mr-2" />
                                                Reassign Booking
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ManageStaffPage;