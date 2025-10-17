import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiUpload, FiImage } from 'react-icons/fi';

const BarbershopProfilePage = () => {
    const { barbershopId } = useParams();
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchBarbershop = async () => {
            try {
                const response = await api.get(`/barbershops/my/${barbershopId}`);
                setBarbershop(response.data);
                if (response.data.main_image_url) {
                    setImagePreview(`http://localhost:5000${response.data.main_image_url}`);
                }
            } catch (error) {
                toast.error('Gagal memuat data barbershop');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBarbershop();
    }, [barbershopId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload image
            handleImageUpload(file);
        }
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await api.post(
                `/barbershops/${barbershopId}/upload-image`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            toast.success('Gambar berhasil diupload!');
            setBarbershop(prev => ({
                ...prev,
                main_image_url: response.data.image_url
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal upload gambar');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
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

            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Profil & Tampilan Barbershop
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Gambar Utama Barbershop
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Gambar ini akan ditampilkan di aplikasi customer. Gunakan foto yang menarik dan berkualitas tinggi.
                    </p>

                    {/* Image Preview */}
                    <div className="mb-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Barbershop"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">
                                        ✓ Aktif
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <FiImage className="mx-auto text-6xl text-gray-300 mb-2" />
                                    <p className="text-gray-500">Belum ada gambar</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <label htmlFor="image-upload" className="block">
                        <div className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition-colors ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                            <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                                {uploading ? 'Uploading...' : 'Klik untuk upload gambar baru'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG (Max. 5MB)
                            </p>
                        </div>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Right Column - Barbershop Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Informasi Barbershop
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Nama</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {barbershop?.name}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Alamat</label>
                            <p className="mt-1 text-gray-900">
                                {barbershop?.address}, {barbershop?.city}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <div className="mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    barbershop?.approval_status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : barbershop?.approval_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {barbershop?.approval_status}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Link
                                to={`/owner/barbershop/${barbershopId}/edit`}
                                className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Edit Informasi Barbershop
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Tips untuk Foto yang Menarik:</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Gunakan pencahayaan yang baik dan natural</li>
                    <li>Pastikan area barbershop terlihat bersih dan rapi</li>
                    <li>Tampilkan interior yang menarik (kursi cukur, cermin, dll)</li>
                    <li>Hindari foto yang blur atau gelap</li>
                    <li>Ukuran optimal: 1200x800 pixels</li>
                </ul>
            </div>
        </div>
    );
};

export default BarbershopProfilePage;