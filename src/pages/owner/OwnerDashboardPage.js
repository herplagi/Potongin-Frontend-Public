// src/pages/owner/OwnerDashboardPage.js - UPDATED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { FiDollarSign, FiCalendar, FiScissors, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const RupiahIcon = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize="18" 
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
        >
            Rp
        </text>
    </svg>
);

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

// Custom Tooltip untuk chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.name}</p>
        <p className="text-sm text-indigo-600">
          Pendapatan: <span className="font-bold">Rp {payload[0].value.toLocaleString('id-ID')}</span>
        </p>
        {payload[1] && (
          <p className="text-sm text-green-600">
            Transaksi: <span className="font-bold">{payload[1].value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const OwnerDashboardPage = () => {
    const { barbershopId } = useParams();
    const [kpis, setKpis] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchKpis = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/barbershops/${barbershopId}/kpis`);
            setKpis(response.data);
            setError(null);
        } catch (error) {
            console.error("Gagal memuat KPI:", error);
            setError(error.response?.data?.message || 'Gagal memuat data KPI');
        } finally {
            setLoading(false);
        }
    }, [barbershopId]);

    const fetchChartData = useCallback(async () => {
        try {
            setChartLoading(true);
            const response = await api.get(`/barbershops/${barbershopId}/chart-data`);
            setChartData(response.data);
        } catch (error) {
            console.error("Gagal memuat data chart:", error);
            // Jika gagal, gunakan data kosong
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    }, [barbershopId]);

    useEffect(() => {
        if (barbershopId) {
            fetchKpis();
            fetchChartData();
        }
    }, [barbershopId, fetchKpis, fetchChartData]);

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

    // Hitung total revenue untuk 7 hari
    const weeklyRevenue = chartData.reduce((sum, day) => sum + day.Pendapatan, 0);
    const weeklyTransactions = chartData.reduce((sum, day) => sum + day.Transaksi, 0);

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
                <h1 className="text-4xl font-bold text-gray-900">Ringkasan Bisnis</h1>
                
                <Link
                    to={`/owner/barbershop/${barbershopId}/reports`}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <FiFileText className="mr-2" size={20} />
                    Lihat Laporan Transaksi
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard 
                    title="Pendapatan Hari Ini" 
                    value={kpis?.revenueToday || 0} 
                    icon={<RupiahIcon className="w-6 h-6" />} 
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

            {/* Weekly Performance Chart */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Performa Mingguan</h2>
                        <p className="text-sm text-gray-600 mt-1">7 Hari Terakhir</p>
                    </div>
                    {!chartLoading && chartData.length > 0 && (
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total 7 Hari</p>
                            <p className="text-xl font-bold text-indigo-600">
                                Rp {weeklyRevenue.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600">
                                {weeklyTransactions} Transaksi
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 mt-4 bg-white rounded-lg shadow-md h-96">
                    {chartLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FiDollarSign size={48} className="mb-4" />
                            <p className="text-lg font-semibold">Belum Ada Data Transaksi</p>
                            <p className="text-sm mt-2">Data akan muncul setelah ada transaksi completed</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
                                        notation: 'compact',
                                        compactDisplay: 'short'
                                    }).format(value)}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Bar 
                                    yAxisId="left"
                                    dataKey="Pendapatan" 
                                    fill="#4F46E5" 
                                    radius={[8, 8, 0, 0]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.Pendapatan > 0 ? '#4F46E5' : '#E5E7EB'} 
                                        />
                                    ))}
                                </Bar>
                                <Bar 
                                    yAxisId="right"
                                    dataKey="Transaksi" 
                                    fill="#10B981" 
                                    radius={[8, 8, 0, 0]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.Transaksi > 0 ? '#10B981' : '#E5E7EB'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Tips Section */}
                {chartData.length === 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Chart akan menampilkan data setelah ada booking yang completed</li>
                            <li>Data diperbarui otomatis setiap kali ada transaksi baru</li>
                            <li>Lihat laporan lengkap di menu "Laporan Transaksi"</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboardPage;