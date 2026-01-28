// src/pages/owner/TransactionReportPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiDownload, FiCalendar, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';


// Custom Rupiah Icon Component
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
            fontSize="14" 
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
        >
            Rp
        </text>
    </svg>
);

const TransactionReportPage = () => {
    const { barbershopId } = useParams();
    const [reportType, setReportType] = useState('weekly'); // 'weekly' atau 'monthly'
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchReport();
    }, [reportType, barbershopId]);

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [reportData, itemsPerPage]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = `/barbershops/${barbershopId}/reports/transactions?type=${reportType}`;
            
            if (customDateRange.startDate && customDateRange.endDate) {
                url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
            }

            const response = await api.get(url);
            setReportData(response.data);
        } catch (error) {
            toast.error('Gagal memuat laporan');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) return;

        // Sheet 1: Summary
        const summaryData = [
            ['LAPORAN TRANSAKSI'],
            ['Barbershop:', reportData.barbershop.name],
            ['Periode:', `${new Date(reportData.period.start).toLocaleDateString('id-ID')} - ${new Date(reportData.period.end).toLocaleDateString('id-ID')}`],
            [],
            ['RINGKASAN'],
            ['Total Pendapatan', `Rp ${reportData.summary.totalRevenue.toLocaleString('id-ID')}`],
            ['Total Transaksi', reportData.summary.totalTransactions],
            ['Rata-rata Transaksi', `Rp ${reportData.summary.averageTransaction.toLocaleString('id-ID')}`],
        ];

        // Sheet 2: Transactions
        const transactionsData = [
            ['Tanggal', 'ID Booking', 'Customer', 'Layanan', 'Staff', 'Harga'],
            ...reportData.transactions.map(t => [
                new Date(t.date).toLocaleString('id-ID'),
                t.booking_id,
                t.customer_name,
                t.service_name,
                t.staff_name || '-',
                t.price
            ])
        ];

        // Sheet 3: Daily Stats
        const dailyStatsData = [
            ['Tanggal', 'Jumlah Transaksi', 'Total Pendapatan'],
            ...reportData.dailyStats.map(d => [
                d.date,
                d.count,
                d.revenue
            ])
        ];

        // Sheet 4: Service Stats
        const serviceStatsData = [
            ['Layanan', 'Jumlah Transaksi', 'Total Pendapatan'],
            ...reportData.serviceStats.map(s => [
                s.name,
                s.count,
                s.revenue
            ])
        ];

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        const ws2 = XLSX.utils.aoa_to_sheet(transactionsData);
        const ws3 = XLSX.utils.aoa_to_sheet(dailyStatsData);
        const ws4 = XLSX.utils.aoa_to_sheet(serviceStatsData);

        XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
        XLSX.utils.book_append_sheet(wb, ws2, 'Transaksi');
        XLSX.utils.book_append_sheet(wb, ws3, 'Harian');
        XLSX.utils.book_append_sheet(wb, ws4, 'Per Layanan');

        const fileName = `Laporan_${reportData.barbershop.name}_${reportType}_${Date.now()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Laporan Excel berhasil diunduh!');
    };

    // const handleExportPDF = () => {
    //     if (!reportData) return;

    //     const doc = new jsPDF();
        
    //     // Header
    //     doc.setFontSize(18);
    //     doc.text('LAPORAN TRANSAKSI', 14, 20);
        
    //     doc.setFontSize(12);
    //     doc.text(`Barbershop: ${reportData.barbershop.name}`, 14, 30);
    //     doc.text(`Periode: ${new Date(reportData.period.start).toLocaleDateString('id-ID')} - ${new Date(reportData.period.end).toLocaleDateString('id-ID')}`, 14, 37);
        
    //     // Summary
    //     doc.setFontSize(14);
    //     doc.text('RINGKASAN', 14, 50);
    //     doc.setFontSize(11);
    //     doc.text(`Total Pendapatan: Rp ${reportData.summary.totalRevenue.toLocaleString('id-ID')}`, 14, 58);
    //     doc.text(`Total Transaksi: ${reportData.summary.totalTransactions}`, 14, 65);
    //     doc.text(`Rata-rata Transaksi: Rp ${reportData.summary.averageTransaction.toLocaleString('id-ID')}`, 14, 72);

    //     // Transactions Table
    //     doc.setFontSize(14);
    //     doc.text('DETAIL TRANSAKSI', 14, 85);
        
    //     const tableData = reportData.transactions.map(t => [
    //         new Date(t.date).toLocaleDateString('id-ID'),
    //         t.customer_name,
    //         t.service_name,
    //         t.staff_name || '-',
    //         `Rp ${t.price.toLocaleString('id-ID')}`
    //     ]);

    //     doc.autoTable({
    //         startY: 90,
    //         head: [['Tanggal', 'Customer', 'Layanan', 'Staff', 'Harga']],
    //         body: tableData,
    //         theme: 'grid',
    //         styles: { fontSize: 9 },
    //         headStyles: { fillColor: [79, 70, 229] }
    //     });

    //     // New page for stats
    //     doc.addPage();
        
    //     // Daily Stats
    //     doc.setFontSize(14);
    //     doc.text('STATISTIK HARIAN', 14, 20);
        
    //     const dailyTableData = reportData.dailyStats.map(d => [
    //         d.date,
    //         d.count.toString(),
    //         `Rp ${d.revenue.toLocaleString('id-ID')}`
    //     ]);

    //     doc.autoTable({
    //         startY: 25,
    //         head: [['Tanggal', 'Jumlah', 'Pendapatan']],
    //         body: dailyTableData,
    //         theme: 'grid',
    //         styles: { fontSize: 10 },
    //         headStyles: { fillColor: [79, 70, 229] }
    //     });

    //     // Service Stats
    //     const finalY = doc.lastAutoTable.finalY + 15;
    //     doc.setFontSize(14);
    //     doc.text('STATISTIK PER LAYANAN', 14, finalY);
        
    //     const serviceTableData = reportData.serviceStats.map(s => [
    //         s.name,
    //         s.count.toString(),
    //         `Rp ${s.revenue.toLocaleString('id-ID')}`
    //     ]);

    //     doc.autoTable({
    //         startY: finalY + 5,
    //         head: [['Layanan', 'Jumlah', 'Pendapatan']],
    //         body: serviceTableData,
    //         theme: 'grid',
    //         styles: { fontSize: 10 },
    //         headStyles: { fillColor: [79, 70, 229] }
    //     });

    //     const fileName = `Laporan_${reportData.barbershop.name}_${reportType}_${Date.now()}.pdf`;
    //     doc.save(fileName);
    //     toast.success('Laporan PDF berhasil diunduh!');
    // };

    // Pagination calculations
    const getPaginatedData = () => {
        if (!reportData || !reportData.transactions) return [];
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return reportData.transactions.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        if (!reportData || !reportData.transactions) return 0;
        return Math.ceil(reportData.transactions.length / itemsPerPage);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll to top of transactions table
        document.getElementById('transactions-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getPageNumbers = () => {
        const totalPages = getTotalPages();
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
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
                to={`/owner/barbershop/${barbershopId}/dashboard`}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
            >
                <FiArrowLeft className="mr-2" />
                Kembali ke Dashboard
            </Link>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Laporan Transaksi</h1>
                    <p className="text-gray-600 mt-1">Lihat dan unduh laporan transaksi barbershop Anda</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipe Laporan
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="weekly">Mingguan (7 Hari Terakhir)</option>
                            <option value="monthly">Bulanan (30 Hari Terakhir)</option>
                            <option value="custom">Kustom</option>
                        </select>
                    </div>

                    {reportType === 'custom' && (
                        <>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={customDateRange.startDate}
                                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={customDateRange.endDate}
                                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </>
                    )}

                    <button
                        onClick={fetchReport}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <FiCalendar className="inline mr-2" />
                        Tampilkan
                    </button>
                </div>
            </div>

            {reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        Rp {reportData.summary.totalRevenue.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <RupiahIcon className="text-4xl text-green-500 w-12 h-12" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {reportData.summary.totalTransactions}
                                    </p>
                                </div>
                                <FiTrendingUp className="text-4xl text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Rata-rata</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">
                                        Rp {reportData.summary.averageTransaction.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <RupiahIcon className="text-4xl text-purple-500 w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Unduh Laporan</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <FiDownload className="mr-2" />
                                Export Excel
                            </button>
                            {/* <button
                                onClick={handleExportPDF}
                                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <FiDownload className="mr-2" />
                                Export PDF
                            </button> */}
                        </div>
                    </div>

                    {/* Statistics Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Daily Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Harian</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.dailyStats.map((stat, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{stat.date}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{stat.count}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                    Rp {stat.revenue.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Service Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Per Layanan</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.serviceStats.map((stat, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{stat.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{stat.count}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                    Rp {stat.revenue.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table with Pagination */}
                    <div id="transactions-table" className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi</h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Tampilkan:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-600">per halaman</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Booking</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {getPaginatedData().map((transaction) => (
                                        <tr key={transaction.booking_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                                {transaction.booking_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {transaction.customer_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {transaction.service_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {transaction.staff_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-mono font-semibold">
                                                Rp {transaction.price.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {reportData.transactions.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Tidak ada transaksi pada periode ini</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {reportData.transactions.length > 0 && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Info */}
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, reportData.transactions.length)} dari {reportData.transactions.length} transaksi
                                </div>

                                {/* Pagination Buttons */}
                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md ${
                                            currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
                                        }`}
                                    >
                                        <FiChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                        currentPage === page
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === getTotalPages()}
                                        className={`p-2 rounded-md ${
                                            currentPage === getTotalPages()
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
                                        }`}
                                    >
                                        <FiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TransactionReportPage;