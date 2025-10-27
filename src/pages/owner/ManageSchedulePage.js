// src/pages/owner/ManageSchedulePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiClock, FiSave } from 'react-icons/fi';

const ManageSchedulePage = () => {
    const { barbershopId } = useParams();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/barbershops/${barbershopId}/schedule`);
            setSchedules(response.data);
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
        
        // Jika ditutup, reset waktu
        if (!newSchedules[index].is_open) {
            newSchedules[index].open_time = null;
            newSchedules[index].close_time = null;
        } else {
            // Set default time jika dibuka
            newSchedules[index].open_time = '09:00:00';
            newSchedules[index].close_time = '21:00:00';
        }
        
        setSchedules(newSchedules);
    };

    const handleTimeChange = (index, field, value) => {
        const newSchedules = [...schedules];
        // Convert HH:MM to HH:MM:SS
        newSchedules[index][field] = value ? `${value}:00` : null;
        setSchedules(newSchedules);
    };

    const handleSave = async () => {
        // Validasi: pastikan semua hari yang buka punya waktu
        const invalidSchedules = schedules.filter(
            s => s.is_open && (!s.open_time || !s.close_time)
        );

        if (invalidSchedules.length > 0) {
            toast.error('Harap isi waktu buka dan tutup untuk semua hari yang aktif');
            return;
        }

        // Validasi: pastikan waktu tutup > waktu buka
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
            await api.put(`/barbershops/${barbershopId}/schedule`, {
                schedules: schedules
            });
            toast.success('Jadwal berhasil disimpan!');
            fetchSchedules(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan jadwal');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
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
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:bg-indigo-400"
                >
                    <FiSave className="mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-700">
                    <strong>ℹ️ Info:</strong> Perubahan jadwal tidak memerlukan review admin dan akan langsung berlaku.
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
                            <tr key={schedule.schedule_id} className={`hover:bg-gray-50 transition-colors ${!schedule.is_open && 'bg-gray-100 opacity-60'}`}>
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
                                        value={schedule.open_time ? schedule.open_time.substring(0, 5) : ''}
                                        onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                                        disabled={!schedule.is_open}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-center disabled:bg-gray-100 disabled:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="time"
                                        value={schedule.close_time ? schedule.close_time.substring(0, 5) : ''}
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

            {/* Tips Section */}
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-800 mb-3 text-lg">
                    💡 Tips Mengatur Jadwal:
                </h3>
                <ul className="text-sm text-indigo-700 space-y-2 list-disc list-inside">
                    <li>Pastikan jadwal sesuai dengan ketersediaan staf Anda</li>
                    <li>Jadwal yang konsisten membantu pelanggan merencanakan kunjungan</li>
                    <li>Jika ada perubahan mendadak, segera update jadwal</li>
                    <li>Waktu buka dan tutup akan digunakan sistem untuk mengatur slot booking</li>
                </ul>
            </div>
        </div>
    );
};

export default ManageSchedulePage;