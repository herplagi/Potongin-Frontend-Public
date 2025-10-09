import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

// Komponen File Input Kustom (tidak ada perubahan)
const CustomFileInput = ({ label, onChange, fileName }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                    <label htmlFor={label} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload file baru</span>
                        <input id={label} name={label} type="file" className="sr-only" onChange={onChange} />
                    </label>
                    <p className="pl-1">atau seret dan lepas</p>
                </div>
                {fileName ? (
                    <p className="text-sm text-green-600 font-semibold">{fileName}</p>
                ) : (
                    <p className="text-xs text-gray-500">PNG, JPG, PDF hingga 2MB</p>
                )}
            </div>
        </div>
    </div>
);

const EditBarbershopPage = () => {
    const { barbershopId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ name: '', address: '', city: '' });
    const [rejectionReason, setRejectionReason] = useState(''); // <-- 1. STATE BARU UNTUK PESAN
    const [ktpFile, setKtpFile] = useState(null);
    const [permitFile, setPermitFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBarbershopData = async () => {
            try {
                const response = await api.get(`/barbershops/my/${barbershopId}`);
                const { name, address, city, rejection_reason } = response.data;
                setFormData({ name, address, city });

                // --- 2. AMBIL DAN SIMPAN PESAN PENOLAKAN ---
                if (rejection_reason) {
                    setRejectionReason(rejection_reason);
                }
                // ------------------------------------------

            } catch (err) {
                setError("Gagal memuat data barbershop.");
            } finally {
                setLoading(false);
            }
        };
        fetchBarbershopData();
    }, [barbershopId]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSubmit = new FormData();
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('address', formData.address);
        dataToSubmit.append('city', formData.city);
        if (ktpFile) dataToSubmit.append('ktp', ktpFile);
        if (permitFile) dataToSubmit.append('permit', permitFile);

        try {
            await api.put(`/barbershops/${barbershopId}`, dataToSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Data berhasil diperbarui dan diajukan ulang!');
            navigate('/owner/my-barbershops');
        } catch (err) {
            setError(err.response?.data?.message || 'Update gagal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p className="p-8">Memuat form edit...</p>;

    return (
        <div>
            <Link to="/owner/my-barbershops" className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4">
                <FiArrowLeft className="mr-2" />
                Kembali ke Daftar Barbershop
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Perbaiki Pendaftaran Barbershop</h1>
            <p className="mt-2 text-gray-600">Perbarui data atau dokumen Anda di bawah ini, lalu ajukan ulang untuk verifikasi oleh Admin.</p>
            
            {/* --- 3. TAMPILKAN PESAN PENOLAKAN JIKA ADA --- */}
            {rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FiAlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800">Catatan Perbaikan dari Admin:</h3>
                            <p className="mt-2 text-md text-red-700 italic">"{rejectionReason}"</p>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------------ */}
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">Informasi Dasar</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Barbershop</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                            <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota</label>
                            <input id="city" type="text" name="city" value={formData.city} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">Dokumen Verifikasi</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload ulang hanya jika dokumen sebelumnya salah atau tidak jelas.</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomFileInput label="ktp" onChange={e => setKtpFile(e.target.files[0])} fileName={ktpFile?.name} />
                        <CustomFileInput label="permit" onChange={e => setPermitFile(e.target.files[0])} fileName={permitFile?.name} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSubmitting ? "Menyimpan..." : "Simpan & Ajukan Ulang"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBarbershopPage;