// pages/owner/BarbershopProfilePage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import LocationPicker from "../../components/LocationPicker";
import {
  FiArrowLeft,
  FiUpload,
  FiImage,
  FiMapPin,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

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

  // State fasilitas
  const [allFacilities, setAllFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [savingFacilities, setSavingFacilities] = useState(false);

  // State edit profil + modal konfirmasi
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    city: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchBarbershop = useCallback(async () => {
    try {
      const response = await api.get(`/barbershops/my/${barbershopId}`);
      setBarbershop(response.data);

      // Isi form profil dari data yang difetch
      setProfileForm({
        name: response.data.name || "",
        address: response.data.address || "",
        city: response.data.city || "",
      });

      if (response.data.main_image_url) {
        setImagePreview(`http://localhost:5000${response.data.main_image_url}`);
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

      if (response.data.facilities && Array.isArray(response.data.facilities)) {
        setSelectedFacilities(
          response.data.facilities.map((f) => f.facility_id)
        );
      }
    } catch (error) {
      toast.error("Gagal memuat data barbershop");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  const fetchAllFacilities = useCallback(async () => {
    setLoadingFacilities(true);
    try {
      const response = await api.get("/barbershops/facilities/all");
      setAllFacilities(response.data || []);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast.error("Gagal memuat daftar fasilitas");
    } finally {
      setLoadingFacilities(false);
    }
  }, []);

  useEffect(() => {
    fetchBarbershop();
    fetchAllFacilities();
  }, [fetchBarbershop, fetchAllFacilities]);

  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) => {
      if (prev.includes(facilityId)) {
        return prev.filter((id) => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  const handleSaveFacilities = async () => {
    setSavingFacilities(true);
    try {
      await api.post(`/barbershops/${barbershopId}/facilities`, {
        facility_ids: selectedFacilities,
      });
      toast.success("Fasilitas berhasil diperbarui!");
      fetchBarbershop();
    } catch (error) {
      console.error("Error saving facilities:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan fasilitas");
    } finally {
      setSavingFacilities(false);
    }
  };

  // Handler field profil (nama & alamat)
  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const openConfirmModal = () => {
    if (!barbershop) return;

    const isChanged =
      profileForm.name.trim() !== (barbershop.name || "").trim() ||
      profileForm.address.trim() !== (barbershop.address || "").trim();

    if (!isChanged) {
      toast.info("Tidak ada perubahan nama atau alamat.");
      return;
    }

    if (!profileForm.name.trim() || !profileForm.address.trim()) {
      toast.error("Nama dan alamat wajib diisi.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleSaveProfileAndResubmit = async () => {
    setIsSavingProfile(true);
    try {
      await api.put(`/barbershops/${barbershopId}`, {
        name: profileForm.name.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city,
      });
      toast.success("Perubahan disimpan dan pengajuan ulang berhasil dikirim.");
      setIsConfirmModalOpen(false);
      fetchBarbershop();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan perubahan profil."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

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
      toast.error(error.response?.data?.message || "Gagal update lokasi");
      console.error(error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsSavingDescription(true);
    try {
      await api.patch(`/barbershops/${barbershopId}/description`, {
        description,
      });
      toast.success("Deskripsi berhasil diperbarui!");
      setBarbershop((prev) => ({ ...prev, description }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal update deskripsi");
      console.error(error);
    } finally {
      setIsSavingDescription(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Barbershop tidak ditemukan</p>
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
        <h1 className="text-3xl font-bold text-gray-800">
          Profil & Foto Barbershop
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola foto utama, deskripsi, lokasi, dan fasilitas barbershop Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri - Edit Profil, Foto & Deskripsi */}
        <div className="space-y-6">

          {/* Card Foto Utama */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiImage className="text-indigo-600 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Foto Utama
              </h2>
            </div>

            <div className="mb-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <FiUpload className="inline mr-2" />
                      Ganti Foto
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                >
                  <FiUpload className="text-gray-400 mb-2" size={40} />
                  <span className="text-gray-600">Klik untuk upload foto</span>
                </label>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Mengupload...</p>
              </div>
            )}
          </div>

          {/* Card Deskripsi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiFileText className="text-indigo-600 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Deskripsi Barbershop
              </h2>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Ceritakan tentang barbershop Anda..."
            />

            <button
              onClick={handleSaveDescription}
              disabled={isSavingDescription}
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {isSavingDescription ? "Menyimpan..." : "Simpan Deskripsi"}
            </button>
          </div>

          {/* Card Edit Profil Dasar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiFileText className="text-indigo-600 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Profil Dasar
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ubah nama dan alamat barbershop. Perubahan ini akan diajukan ulang
              ke admin untuk ditinjau.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barbershop
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileFieldChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileFieldChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota
                </label>
                <input
                  type="text"
                  name="city"
                  value={profileForm.city}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <button
              onClick={openConfirmModal}
              className="mt-4 w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </div>

        {/* Kolom Kanan - Lokasi & Fasilitas */}
        <div className="space-y-6">
          {/* Card Lokasi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FiMapPin className="text-indigo-600 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Lokasi Barbershop
              </h2>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p className="mb-2">
                Klik pada peta untuk memilih lokasi barbershop Anda
              </p>
              {locationData.latitude && locationData.longitude && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="font-medium">Koordinat saat ini:</p>
                  <p>Latitude: {locationData.latitude.toFixed(6)}</p>
                  <p>Longitude: {locationData.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>

            <LocationPicker
              initialPosition={locationData}
              onLocationChange={handleLocationChange}
            />

            <button
              onClick={handleSaveLocation}
              disabled={
                isUpdatingLocation ||
                locationData.latitude === null ||
                locationData.longitude === null
              }
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {isUpdatingLocation ? "Menyimpan..." : "Simpan Lokasi"}
            </button>
          </div>

          {/* Card Fasilitas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiCheckCircle className="text-indigo-600 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Fasilitas Barbershop
                </h2>
              </div>
              {selectedFacilities.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedFacilities.length} dipilih
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Pilih fasilitas yang tersedia di barbershop Anda
            </p>

            {loadingFacilities ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Memuat fasilitas...
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4 max-h-96 overflow-y-auto">
                  {allFacilities.map((facility) => {
                    const isSelected = selectedFacilities.includes(
                      facility.facility_id
                    );
                    return (
                      <button
                        key={facility.facility_id}
                        onClick={() => toggleFacility(facility.facility_id)}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
                          ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-indigo-300 text-gray-700"
                          }
                        `}
                      >
                        <span className="text-sm font-medium truncate">
                          {facility.name}
                        </span>
                        {isSelected && (
                          <FiCheckCircle
                            className="text-indigo-600 flex-shrink-0 ml-2"
                            size={18}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveFacilities}
                  disabled={savingFacilities}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {savingFacilities ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Simpan Fasilitas
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Simpan Profil */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex items-start">
                <FiAlertTriangle
                  className="text-amber-500 mt-1 mr-3 flex-shrink-0"
                  size={22}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Perubahan Profil
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Jika Anda menyimpan perubahan nama atau alamat, barbershop
                    akan diajukan ulang untuk review admin dan status menjadi
                    pending.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">Nama baru:</span>{" "}
                  {profileForm.name}
                </p>
                <p>
                  <span className="font-medium">Alamat baru:</span>{" "}
                  {profileForm.address}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isSavingProfile}
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfileAndResubmit}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-400"
                disabled={isSavingProfile}
              >
                {isSavingProfile
                  ? "Menyimpan..."
                  : "Ya, Simpan & Ajukan Ulang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbershopProfilePage;