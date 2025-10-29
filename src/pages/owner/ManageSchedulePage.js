// src/pages/owner/ManageSchedulePage.js - UPDATED WITH CONFLICT HANDLING
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiClock, FiSave, FiAlertTriangle } from 'react-icons/fi';

const ManageSchedulePage = () => {
    const { barbershopId } = useParams();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State untuk modal konfirmasi konflik
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictData, setConflictData] = useState(null);

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/barbershops/${barbershopId}/schedule`);
            
            const formattedSchedules = response.data.map(schedule => ({
                ...schedule,
                open_time: schedule.open_time || null,
                close_time: schedule.close_time || null
            }));
            
            setSchedules(formattedSchedules);
        } catch (error) {
            toast.error('Gagal memuat jadwal');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [barbershopId]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleToggleDay = (index) => {
        const newSchedules = [...schedules];
        newSchedules[index].is_open = !newSchedules[index].is_open;
        
        if (!newSchedules[index].is_open) {
            newSchedules[index].open_time = null;
            newSchedules[index].close_time = null;
        } else {
            newSchedules[index].open_time = '09:00';
            newSchedules[index].close_time = '21:00';
        }
        
        setSchedules(newSchedules);
    };

    const handleTimeChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value || null;
        setSchedules(newSchedules);
    };

    const handleSave = async (forceUpdate = false) => {
        // Validasi
        const invalidSchedules = schedules.filter(
            s => s.is_open && (!s.open_time || !s.close_time)
        );

        if (invalidSchedules.length > 0) {
            toast.error('Harap isi waktu buka dan tutup untuk semua hari yang aktif');
            return;
        }

        const invalidTimes = schedules.filter(s => {
            if (!s.is_open) return false;
            return s.close_time <= s.open_time;
        });

        if (invalidTimes.length > 0) {
            toast.error('Waktu tutup harus lebih besar dari waktu buka');
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.put(`/barbershops/${barbershopId}/schedule`, {
                schedules: schedules,
                force_update: forceUpdate
            });

            // ✅ CEK APAKAH ADA KONFLIK
            if (response.status === 409) {
                // Ada konflik, tampilkan modal konfirmasi
                setConflictData(response.data);
                setShowConflictModal(true);
                setIsSaving(false);
                return;
            }

            // Berhasil tanpa konflik atau sudah force update
            toast.success('Jadwal berhasil disimpan!');
            
            if (response.data.affected_bookings) {
                toast.warning(
                    `⚠️ ${response.data.affected_bookings.count} booking terpengaruh. ${response.data.affected_bookings.message}`,
                    { autoClose: 8000 }
                );
            }
            
            fetchSchedules();
            setShowConflictModal(false);
        } catch (error) {
            if (error.response?.status === 409) {
                // Ada konflik
                setConflictData(error.response.data);
                setShowConflictModal(true);
            } else {
                toast.error(error.response?.data?.message || 'Gagal menyimpan jadwal');
                console.error(error);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleForceUpdate = () => {
        handleSave(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

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
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Jadwal Operasional</h1>
                    <p className="text-gray-600 mt-1">Atur jam buka dan tutup barbershop Anda</p>
                </div>
                <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:bg-indigo-400"
                >
                    <FiSave className="mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-700">
                    <strong>ℹ️ Info:</strong> Perubahan jadwal tidak memerlukan review admin dan akan langsung berlaku.
                    Sistem akan memperingatkan jika ada booking customer yang terpengaruh.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hari
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jam Buka
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jam Tutup
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map((schedule, index) => (
                            <tr key={index} className={`hover:bg-gray-50 transition-colors ${!schedule.is_open && 'bg-gray-100 opacity-60'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FiClock className={`mr-2 ${schedule.is_open ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span className="text-sm font-medium text-gray-900">
                                            {schedule.day_of_week}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleToggleDay(index)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            schedule.is_open ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                schedule.is_open ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <div className="mt-1">
                                        <span className={`text-xs font-semibold ${schedule.is_open ? 'text-green-600' : 'text-gray-500'}`}>
                                            {schedule.is_open ? 'Buka' : 'Tutup'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="time"
                                        value={schedule.open_time || ''}
                                        onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                                        disabled={!schedule.is_open}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-center disabled:bg-gray-100 disabled:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="time"
                                        value={schedule.close_time || ''}
                                        onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                                        disabled={!schedule.is_open}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-center disabled:bg-gray-100 disabled:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Konflik Booking */}
            <Transition appear show={showConflictModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowConflictModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <div className="flex items-center space-x-3 mb-4">
                                    <FiAlertTriangle className="text-4xl text-amber-500" />
                                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                                        Peringatan: Ada Booking yang Terpengaruh!
                                    </Dialog.Title>
                                </div>

                                {conflictData && (
                                    <>
                                        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                                            <p className="text-sm text-amber-800">
                                                <strong>{conflictData.affected_bookings?.count} booking</strong> akan berada di luar jam operasional baru atau pada hari tutup.
                                            </p>
                                            <p className="text-sm text-amber-700 mt-2">
                                                {conflictData.affected_bookings?.warning}
                                            </p>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto mb-6">
                                            <h3 className="font-semibold text-gray-800 mb-3">Detail Booking yang Terpengaruh:</h3>
                                            <div className="space-y-3">
                                                {conflictData.affected_bookings?.details?.map((detail, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{detail.customer_name}</p>
                                                                <p className="text-sm text-gray-600">{detail.customer_phone}</p>
                                                            </div>
                                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                                {detail.day_of_week}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-700 space-y-1">
                                                            <p><strong>Layanan:</strong> {detail.service_name}</p>
                                                            <p><strong>Tanggal:</strong> {detail.booking_date}</p>
                                                            <p><strong>Waktu Booking:</strong> {detail.booking_time}</p>
                                                            <p className="text-red-600"><strong>Masalah:</strong> {detail.conflict_reason}</p>
                                                            <p><strong>Jadwal Baru:</strong> {detail.new_schedule}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                            <h4 className="font-semibold text-blue-800 mb-2">Langkah yang Perlu Diambil:</h4>
                                            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                                                <li>Hubungi customer segera untuk memberitahu perubahan jadwal</li>
                                                <li>Tawarkan opsi: reschedule ke waktu lain atau cancel dengan refund</li>
                                                <li>Update status booking sesuai kesepakatan dengan customer</li>
                                                <li>Dokumentasikan komunikasi untuk rekam jejak</li>
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
                                    <button
                                        onClick={handleForceUpdate}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:bg-amber-400"
                                    >
                                        {isSaving ? 'Menyimpan...' : 'Tetap Simpan & Saya Akan Hubungi Customer'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-800 mb-3 text-lg">
                    💡 Tips Mengatur Jadwal:
                </h3>
                <ul className="text-sm text-indigo-700 space-y-2 list-disc list-inside">
                    <li>Pastikan jadwal sesuai dengan ketersediaan staf Anda</li>
                    <li>Jadwal yang konsisten membantu pelanggan merencanakan kunjungan</li>
                    <li>Sistem akan memperingatkan jika perubahan jadwal mempengaruhi booking yang ada</li>
                    <li><strong>Penting:</strong> Selalu hubungi customer jika ada perubahan yang mempengaruhi booking mereka</li>
                    <li>Pertimbangkan memberikan kompensasi (diskon/gratis) untuk customer yang terdampak</li>
                </ul>
            </div>
        </div>
    );
};

export default ManageSchedulePage;