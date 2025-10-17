import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { FiDollarSign, FiCalendar, FiScissors, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data dummy untuk grafik
const chartData = [
  { name: 'Sen', Pendapatan: 400000 },
  { name: 'Sel', Pendapatan: 300000 },
  { name: 'Rab', Pendapatan: 600000 },
  { name: 'Kam', Pendapatan: 278000 },
  { name: 'Jum', Pendapatan: 189000 },
  { name: 'Sab', Pendapatan: 950000 },
  { name: 'Min', Pendapatan: 730000 },
];

const KpiCard = ({ title, value, icon, formatAsCurrency = false }) => (
  <div className="p-6 bg-white rounded-2xl shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {formatAsCurrency ? `Rp ${Number(value).toLocaleString('id-ID')}` : value}
        </p>
      </div>
      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">{icon}</div>
    </div>
  </div>
);

const OwnerDashboardPage = () => {
    const { barbershopId } = useParams();
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                setLoading(true);
                // ✅ FIX: Endpoint yang benar
                const response = await api.get(`/barbershops/${barbershopId}/kpis`);
                setKpis(response.data);
                setError(null);
            } catch (error) {
                console.error("Gagal memuat KPI:", error);
                setError(error.response?.data?.message || 'Gagal memuat data KPI');
            } finally {
                setLoading(false);
            }
        };
        
        if (barbershopId) {
            fetchKpis();
        }
    }, [barbershopId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
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

            <h1 className="text-4xl font-bold text-gray-900">Ringkasan Bisnis</h1>

            <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard 
                    title="Pendapatan Hari Ini" 
                    value={kpis?.revenueToday || 0} 
                    icon={<FiDollarSign size={24}/>} 
                    formatAsCurrency 
                />
                <KpiCard 
                    title="Booking Hari Ini" 
                    value={kpis?.bookingsToday || 0} 
                    icon={<FiCalendar size={24}/>} 
                />
                <KpiCard 
                    title="Booking Akan Datang" 
                    value={kpis?.upcomingBookings || 0} 
                    icon={<FiCalendar size={24}/>} 
                />
                <KpiCard 
                    title="Total Layanan Aktif" 
                    value={kpis?.serviceCount || 0} 
                    icon={<FiScissors size={24}/>} 
                />
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800">Performa Mingguan</h2>
                <div className="p-4 mt-4 bg-white rounded-lg shadow-md h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)}/>
                            <Tooltip formatter={(value) => [`Rp ${new Intl.NumberFormat('id-ID').format(value)}`, 'Pendapatan']}/>
                            <Legend />
                            <Bar dataKey="Pendapatan" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboardPage;