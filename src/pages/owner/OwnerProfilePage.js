// src/pages/owner/OwnerProfilePage.js
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiEdit3,
  FiSave,
  FiX,
  FiLock,
  FiCamera,
} from "react-icons/fi";

const OwnerProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Inisialisasi formData dari user saat pertama kali atau saat beralih mode
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar.");
        return;
      }

      // ✅ HAPUS: setSelectedFile(file);

      // Buat preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Langsung upload
      handleUploadPhoto(file);
    }
  };

  const handleUploadPhoto = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("picture", file);

      const response = await api.post("/users/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user context dengan picture URL dari response
      const pictureUrl =
        response.data.picture_url || response.data.user?.picture;

      setUser((prev) => ({
        ...prev,
        picture: pictureUrl,
      }));

      // Clear preview setelah upload berhasil
      setPreviewUrl(null);
      // ✅ HAPUS: setSelectedFile(null);

      toast.success("Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error("Upload photo error:", error);
      toast.error(
        error.response?.data?.message || "Gagal mengunggah foto profil"
      );
      setPreviewUrl(null);
      // ✅ HAPUS: setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Kembalikan ke data asli
    if (user) {
      setFormData({
        name: user.name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error("Nomor telepon tidak boleh kosong");
      return;
    }
    if (formData.phone_number.length < 10) {
      toast.error("Nomor telepon minimal 10 digit");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/users/profile", {
        name: formData.name,
        phone_number: formData.phone_number,
      });

      // Perbarui context
      setUser((prev) => ({
        ...prev,
        name: formData.name,
        phone_number: formData.phone_number,
      }));

      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Memuat profil...</div>
      </div>
    );
  }

  // Fungsi untuk mendapatkan URL gambar profil
  const getProfilePictureUrl = () => {
    if (previewUrl) return previewUrl;

    if (user.picture) {
      if (user.picture.startsWith("http")) {
        return user.picture;
      }
      return `http://localhost:5000${user.picture}`;
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/owner/my-barbershops"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium mb-4 transition-colors"
        >
          <FiArrowLeft className="mr-1.5" /> Kembali ke Dashboard
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Avatar dengan fitur upload */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-50 bg-gray-100">
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image load error:", e.target.src);
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-indigo-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Button untuk upload foto */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                title="Ubah foto profil"
              >
                {uploading ? (
                  <div className="animate-spin">
                    <FiCamera size={14} />
                  </div>
                ) : (
                  <FiCamera size={14} />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-gray-500 text-sm">Informasi akun pemilik</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
            >
              <FiEdit3 size={16} />
              Edit Profil
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FiX size={16} />
              Batal
            </button>
          )}
        </div>
      </div>

      {/* Konten Profil */}
      {isEditing ? (
        /* --- Mode Edit --- */
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-xl border border-gray-200"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-default"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Email tidak dapat diubah.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 font-medium"
            >
              <FiSave size={16} />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      ) : (
        /* --- Mode Tampil (Read-only) --- */
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2.5 bg-indigo-50 rounded-lg">
              <FiUser className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2.5 bg-indigo-50 rounded-lg">
              <FiMail className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2.5 bg-indigo-50 rounded-lg">
              <FiPhone className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nomor Telepon</p>
              <p className="text-gray-900 font-medium">
                {user.phone_number || "-"}
              </p>
            </div>
          </div>

          {user.is_owner && user.is_customer && (
            <div className="pt-4 border-t border-gray-100">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                Akun Ganda: Pemilik & Pelanggan
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ubah Password */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
          <FiLock className="text-indigo-600" /> Keamanan Akun
        </h2>
        <p className="text-gray-600 text-sm mb-3">
          Kelola kata sandi Anda untuk menjaga keamanan akun.
        </p>
        <Link
          to="/owner/change-password"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium group"
        >
          Ubah Kata Sandi
          <FiEdit3 className="group-hover:translate-x-0.5 transition-transform text-sm" />
        </Link>
      </div>
    </div>
  );
};

export default OwnerProfilePage;