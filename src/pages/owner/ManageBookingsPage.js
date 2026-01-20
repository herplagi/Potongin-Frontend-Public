import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';

const ManageBookingsPage = () => {
    const { barbershopId } = useParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        checked_in: 0,
        in_progress: 0,
        completed: 0,
        awaiting_confirmation: 0
    });

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching bookings for barbershop:', barbershopId);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login kembali.');
            }

            // ✅ FIX: Correct API endpoint
            const response = await api.get(`/bookings/${barbershopId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ API Response:', response);
            
            if (!response.data) {
                console.warn('⚠️ Empty response data');
                setBookings([]);
                return;
            }

            if (!Array.isArray(response.data)) {
                console.error('❌ Invalid response format:', response.data);
                throw new Error('Format data tidak valid dari server');
            }
            
            console.log(`✅ Received ${response.data.length} bookings`);
            setBookings(response.data);
            
            // Calculate stats
            const newStats = {
                total: response.data.length,
                confirmed: response.data.filter(b => b.status === 'confirmed').length,
                checked_in: response.data.filter(b => b.status === 'checked_in').length,
                in_progress: response.data.filter(b => b.status === 'in_progress').length,
                completed: response.data.filter(b => b.status === 'completed').length,
                awaiting_confirmation: response.data.filter(b => b.status === 'awaiting_confirmation').length,
            };
            setStats(newStats);
            
        } catch (error) {
            console.error('❌ Error fetching bookings:', error);
            
            let errorMessage = 'Gagal memuat data booking';
            
            if (error.response) {
                console.error('Response error:', {
                    status: error.response.status,
                    data: error.response.data
                });
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                console.error('Request error:', error.request);
                errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.';
            } else {
                console.error('Error:', error.message);
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [barbershopId]);

    useEffect(() => {
        if (barbershopId) {
            fetchBookings();
        } else {
            setError('ID Barbershop tidak ditemukan');
            setLoading(false);
        }
    }, [fetchBookings, barbershopId]);

    const handleStartService = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await api.post(`/bookings/${barbershopId}/bookings/${bookingId}/start`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Layanan dimulai');
            fetchBookings();
        } catch (error) {
            console.error('Error starting service:', error);
            toast.error(error.response?.data?.message || 'Gagal memulai layanan');
        }
    };

    const handleCompleteService = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await api.post(`/bookings/${barbershopId}/bookings/${bookingId}/complete`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Layanan selesai, menunggu konfirmasi customer');
            fetchBookings();
        } catch (error) {
            console.error('Error completing service:', error);
            toast.error(error.response?.data?.message || 'Gagal menyelesaikan layanan');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Pembayaran' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terkonfirmasi' },
            checked_in: { bg: 'bg-purple-100', text: 'text-purple-800', label: '✓ Check-in' },
            in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: '⏳ Sedang Dilayani' },
            awaiting_confirmation: { bg: 'bg-orange-100', text: 'text-orange-800', label: '⏰ Menunggu Konfirmasi' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' },
            no_show: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Tidak Hadir' },
        };
        const badge = badges[status] || badges.confirmed;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        return status === 'paid' ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ Dibayar
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Belum Dibayar
            </span>
        );
    };

    const filteredBookings = filter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data booking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <Link
                    to="/owner/my-barbershops"
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
                >
                    <FiArrowLeft className="mr-2" />
                    Kembali ke Daftar Barbershop
                </Link>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <button
                            onClick={fetchBookings}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                        <p className="text-sm text-gray-600">
                            Pastikan backend sudah berjalan di http://localhost:5000
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Link
                to="/owner/my-barbershops"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
            >
                <FiArrowLeft className="mr-2" />
                Kembali ke Daftar Barbershop
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Kelola Booking</h1>
                <p className="text-gray-600 mt-1">Pantau dan kelola semua booking barbershop Anda</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Total Booking</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-blue-50 rounded-lg shadow p-4">
                    <p className="text-sm text-blue-600">Terkonfirmasi</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.confirmed}</p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-4">
                    <p className="text-sm text-purple-600">Check-in</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.checked_in}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg shadow p-4">
                    <p className="text-sm text-indigo-600">Dilayani</p>
                    <p className="text-2xl font-bold text-indigo-800">{stats.in_progress}</p>
                </div>
                <div className="bg-orange-50 rounded-lg shadow p-4">
                    <p className="text-sm text-orange-600">Konfirmasi</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.awaiting_confirmation}</p>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4">
                    <p className="text-sm text-green-600">Selesai</p>
                    <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b mb-6 pb-2">
                {[
                    { key: 'all', label: 'Semua' },
                    { key: 'confirmed', label: 'Terkonfirmasi' },
                    { key: 'checked_in', label: 'Check-in' },
                    { key: 'in_progress', label: 'Sedang Dilayani' },
                    { key: 'awaiting_confirmation', label: 'Menunggu Konfirmasi' },
                    { key: 'completed', label: 'Selesai' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filter === key
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <div className="text-gray-400 text-5xl mb-4">📅</div>
                        <p className="text-gray-500 text-lg">Tidak ada booking untuk filter ini</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.booking_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {getStatusBadge(booking.status)}
                                        {getPaymentBadge(booking.payment_status)}
                                        {booking.check_in_code && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                PIN: {booking.check_in_code}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {booking.Service?.name || 'Layanan'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ID: #{booking.booking_id?.substring(0, 8)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {booking.Service?.duration_minutes || 0} menit
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <FiUser className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium">{booking.customer?.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{booking.customer?.phone_number || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FiCalendar className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Jadwal</p>
                                        <p className="font-medium">
                                            {new Date(booking.booking_time).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(booking.booking_time).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {booking.Staff && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Kapster:</span>
                                    <span className="font-medium">{booking.Staff.name}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                {booking.status === 'checked_in' && booking.payment_status === 'paid' && (
                                    <button
                                        onClick={() => handleStartService(booking.booking_id)}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiClock />
                                        Mulai Layanan
                                    </button>
                                )}
                                
                                {booking.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleCompleteService(booking.booking_id)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle />
                                        Selesaikan Layanan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageBookingsPage;