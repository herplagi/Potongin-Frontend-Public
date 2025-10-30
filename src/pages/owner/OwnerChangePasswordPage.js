// src/pages/owner/OwnerChangePasswordPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { FiArrowLeft, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
const OwnerChangePasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.current_password) {
      toast.error("Password lama wajib diisi");
      return false;
    }

    if (!formData.new_password) {
      toast.error("Password baru wajib diisi");
      return false;
    }

    if (formData.new_password.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Konfirmasi password tidak cocok");
      return false;
    }

    if (formData.current_password === formData.new_password) {
      toast.error("Password baru tidak boleh sama dengan password lama");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.patch("/users/change-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      toast.success("Password berhasil diubah! Silakan login kembali.");

      // Redirect ke halaman profil setelah 2 detik
      setTimeout(() => {
        navigate("/owner/profile");
      }, 2000);
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/owner/profile"
        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Kembali ke Profil
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ubah Password</h1>
        <p className="text-gray-600 mb-8">
          Pastikan password baru Anda kuat dan unik
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Security Tips */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start">
              <FiShield
                className="text-blue-500 mt-1 mr-3 flex-shrink-0"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Tips Keamanan Password:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Gunakan minimal 8 karakter</li>
                  <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                  <li>• Jangan gunakan informasi pribadi yang mudah ditebak</li>
                  <li>• Ubah password secara berkala</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiLock className="mr-2" />
                Password Lama
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiLock className="mr-2" />
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={
                        formData.new_password.length >= 6
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {formData.new_password.length >= 6 ? "✓" : "✗"} Minimal 6
                      karakter
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiLock className="mr-2" />
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
              {formData.confirm_password && (
                <p
                  className={`text-xs mt-2 ${
                    formData.new_password === formData.confirm_password
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formData.new_password === formData.confirm_password
                    ? "✓ Password cocok"
                    : "✗ Password tidak cocok"}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end pt-6 border-t space-x-4">
              <button
                type="button"
                onClick={() => navigate("/owner/profile")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              >
                {loading ? "Menyimpan..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerChangePasswordPage;
