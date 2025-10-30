// src/pages/owner/OwnerProfilePage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "react-icons/fi";

const OwnerProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
  });

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
      setIsEditing(false); // Kembali ke mode tampil
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
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-indigo-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-default"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
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