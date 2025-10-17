import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiCalendar, FiUser, FiDollarSign, FiClock } from 'react-icons/fi';

const ManageBookingsPage = () => {
    const { barbershopId } = useParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/bookings/barbershop/${barbershopId}`);
            setBookings(response.data);
        } catch (error) {
            toast.error('Gagal memuat booking');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [barbershopId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await api.patch(`/bookings/barbershop/${barbershopId}/${bookingId}`, {
                status: newStatus
            });
            toast.success('Status booking berhasil diperbarui');
            fetchBookings();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending_payment: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            failed: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredBookings = filter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    if (loading) {
        return <div className="text-center mt-8">Loading bookings...</div>;
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
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Booking</h1>
                    <p className="text-gray-600 mt-1">Total: {bookings.length} booking</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b mb-6">
                {['all', 'confirmed', 'completed', 'pending_payment'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 text-sm font-medium ${
                            filter === status
                                ? 'border-b-2 border-indigo-500 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {status === 'all' ? 'Semua' : status.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Tidak ada booking untuk filter ini</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.booking_id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.payment_status)}`}>
                                            {booking.payment_status === 'paid' ? '✓ Dibayar' : 'Belum Dibayar'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {booking.Service?.name}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <FiUser className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium">{booking.customer?.name}</p>
                                        <p className="text-xs text-gray-500">{booking.customer?.phone_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiCalendar className="text-gray-400" />
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
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Kapster: <span className="font-medium">{booking.Staff.name}</span></p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {booking.payment_status === 'paid' && booking.status === 'confirmed' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleStatusChange(booking.booking_id, 'completed')}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Tandai Selesai
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(booking.booking_id, 'no_show')}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                    >
                                        Customer Tidak Datang
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageBookingsPage;