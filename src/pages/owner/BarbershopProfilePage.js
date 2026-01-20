// pages/owner/BarbershopProfilePage.js
import React, { useState, useEffect } from "react";
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
  FiX,
  FiPlus
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
  
  // ✅ NEW: Facilities state
  const [allFacilities, setAllFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [savingFacilities, setSavingFacilities] = useState(false);

  useEffect(() => {
    fetchBarbershop();
    fetchAllFacilities();
  }, [barbershopId]);

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
      
      // Set selected facilities
      if (response.data.facilities && Array.isArray(response.data.facilities)) {
        setSelectedFacilities(response.data.facilities.map(f => f.facility_id));
      }
    } catch (error) {
      toast.error("Gagal memuat data barbershop");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch all available facilities
  const fetchAllFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const response = await api.get('/barbershops/facilities/all');
      setAllFacilities(response.data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Gagal memuat daftar fasilitas');
    } finally {
      setLoadingFacilities(false);
    }
  };

  // ✅ NEW: Toggle facility selection
  const toggleFacility = (facilityId) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facilityId)) {
        return prev.filter(id => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  // ✅ NEW: Save facilities
  const handleSaveFacilities = async () => {
    setSavingFacilities(true);
    try {
      await api.post(`/barbershops/${barbershopId}/facilities`, {
        facility_ids: selectedFacilities
      });
      toast.success('Fasilitas berhasil diperbarui!');
      fetchBarbershop(); // Refresh data
    } catch (error) {
      console.error('Error saving facilities:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan fasilitas');
    } finally {
      setSavingFacilities(false);
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
      toast.error(
        error.response?.data?.message || "Gagal update deskripsi"
      );
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
        {/* Left Column - Image & Description */}
        <div className="space-y-6">
          {/* Main Image Card */}
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

          {/* Description Card */}
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
        </div>

        {/* Right Column - Location & Facilities */}
        <div className="space-y-6">
          {/* Location Card */}
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

          {/* ✅ NEW: Facilities Card */}
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
                <p className="text-sm text-gray-600 mt-2">Memuat fasilitas...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4 max-h-96 overflow-y-auto">
                  {allFacilities.map((facility) => {
                    const isSelected = selectedFacilities.includes(facility.facility_id);
                    return (
                      <button
                        key={facility.facility_id}
                        onClick={() => toggleFacility(facility.facility_id)}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                          }
                        `}
                      >
                        <span className="text-sm font-medium truncate">
                          {facility.name}
                        </span>
                        {isSelected && (
                          <FiCheckCircle className="text-indigo-600 flex-shrink-0 ml-2" size={18} />
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
    </div>
  );
};

export default BarbershopProfilePage;