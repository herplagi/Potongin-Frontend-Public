// pages/owner/BarbershopProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import LocationPicker from "../../components/LocationPicker";
import { FiArrowLeft, FiUpload, FiImage, FiMapPin, FiFileText } from "react-icons/fi";

const BarbershopProfilePage = () => {
  const { barbershopId } = useParams();
  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  useEffect(() => {
    const fetchBarbershop = async () => {
      try {
        const response = await api.get(`/barbershops/my/${barbershopId}`);
        setBarbershop(response.data);
        if (response.data.main_image_url) {
          setImagePreview(
            `http://localhost:5000${response.data.main_image_url}`
          );
        }
        setDescription(response.data.description || "");
        setLocationData({
          latitude: response.data.latitude
            ? parseFloat(response.data.latitude)
            : null,
          longitude: response.data.longitude
            ? parseFloat(response.data.longitude)
            : null,
        });
      } catch (error) {
        toast.error("Gagal memuat data barbershop");
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await api.post(
        `/barbershops/${barbershopId}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Gambar berhasil diupload!");
      setBarbershop((prev) => ({
        ...prev,
        main_image_url: response.data.image_url,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal upload gambar");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleLocationChange = (latlng) => {
    setLocationData({
      latitude: latlng.lat,
      longitude: latlng.lng,
    });
  };

  const handleSaveLocation = async () => {
    if (locationData.latitude === null || locationData.longitude === null) {
      toast.error("Silakan pilih lokasi di peta terlebih dahulu.");
      return;
    }
    setIsUpdatingLocation(true);
    try {
      await api.patch(`/barbershops/${barbershopId}/location`, {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      toast.success("Lokasi berhasil diperbarui!");
      setBarbershop((prev) => ({
        ...prev,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui lokasi.");
      console.error(error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSaveDescription = async () => {
    if (isSavingDescription) return;
    
    // Validasi minimal karakter
    if (description.trim().length < 10) {
      toast.error("Deskripsi minimal 10 karakter");
      return;
    }
    
    setIsSavingDescription(true);
    try {
      await api.put(`/barbershops/${barbershopId}`, { description });
      toast.success("Deskripsi barbershop berhasil diperbarui!");
      setBarbershop((prev) => ({ ...prev, description }));
    } catch (error) {
      console.error("Gagal menyimpan deskripsi:", error);
      toast.error(
        error.response?.data?.message || "Gagal memperbarui deskripsi."
      );
    } finally {
      setIsSavingDescription(false);
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
        {/* Kolom Kiri - Gambar & Deskripsi */}
        <div className="space-y-8">
          {/* Bagian Gambar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Gambar Utama Barbershop
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Gambar ini akan ditampilkan di aplikasi customer. Gunakan foto yang
              menarik dan berkualitas tinggi.
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
              <div
                className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition-colors ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {uploading ? "Uploading..." : "Klik untuk upload gambar baru"}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max. 5MB)</p>
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

          {/* ✅ BAGIAN DESKRIPSI BARU */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiFileText className="mr-2" /> Deskripsi Barbershop
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Ceritakan tentang barbershop Anda, fasilitas yang tersedia, dan keunggulan yang membuat pelanggan tertarik.
            </p>

            {/* Textarea Deskripsi */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Barbershop modern dengan AC, WiFi gratis, dan kursi tunggu yang nyaman. Kami melayani berbagai gaya potongan rambut dari klasik hingga trendy. Staff kami berpengalaman dan profesional."
              rows={8}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {description.length}/500 karakter
              </p>
              {description.length < 10 && (
                <p className="text-xs text-amber-600">
                  Minimal 10 karakter
                </p>
              )}
            </div>

            {/* Tombol Simpan Deskripsi */}
            <div className="mt-4">
              <button
                onClick={handleSaveDescription}
                disabled={isSavingDescription || description.trim().length < 10}
                className={`w-full text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  isSavingDescription || description.trim().length < 10
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isSavingDescription ? "Menyimpan..." : "Simpan Deskripsi"}
              </button>
            </div>

            {/* Preview Deskripsi */}
            {description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2">Preview:</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan - Informasi & Lokasi */}
        <div className="space-y-8">
          {/* Informasi Dasar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Informasi Barbershop
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {barbershop?.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Alamat
                </label>
                <p className="mt-1 text-gray-900">
                  {barbershop?.address}, {barbershop?.city}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      barbershop?.approval_status === "approved"
                        ? "bg-green-100 text-green-800"
                        : barbershop?.approval_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {barbershop?.approval_status}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Link
                  to={`/owner/barbershop/${barbershopId}/edit`}
                  className="block w-full text-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Edit Info Dasar (Perlu Review)
                </Link>
              </div>
            </div>
          </div>

          {/* Bagian Lokasi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiMapPin className="mr-2" /> Lokasi Barbershop
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Atur lokasi akurat barbershop Anda. Perubahan ini tidak memerlukan
              review admin.
            </p>

            <LocationPicker
              initialLat={locationData.latitude}
              initialLng={locationData.longitude}
              onLocationChange={handleLocationChange}
            />

            <div className="mt-4">
              <button
                onClick={handleSaveLocation}
                disabled={isUpdatingLocation}
                className={`w-full text-center px-4 py-2 rounded-md transition-colors ${
                  isUpdatingLocation
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isUpdatingLocation ? "Menyimpan Lokasi..." : "Simpan Lokasi"}
              </button>
            </div>

            {locationData.latitude !== null &&
              locationData.longitude !== null && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">Koordinat saat ini:</p>
                  <p className="text-sm font-mono">
                    {locationData.latitude.toFixed(6)},{" "}
                    {locationData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="font-semibold text-blue-800 mb-3 text-lg">
          💡 Tips Membuat Profil Menarik:
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Foto:</h4>
            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
              <li>Gunakan pencahayaan yang baik</li>
              <li>Tampilkan interior yang bersih dan rapi</li>
              <li>Ukuran optimal: 1200x800 pixels</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Deskripsi:</h4>
            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
              <li>Sebutkan fasilitas (AC, WiFi, parkir)</li>
              <li>Highlight keunggulan Anda</li>
              <li>Jelaskan spesialisasi layanan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarbershopProfilePage;