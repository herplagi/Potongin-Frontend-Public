import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const RegisterBarbershopPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Padang", // ✅ Default value
  });

  const [openingHours, setOpeningHours] = useState({
    Senin: { aktif: false, buka: "08:00", tutup: "21:00" },
    Selasa: { aktif: false, buka: "08:00", tutup: "21:00" },
    Rabu: { aktif: false, buka: "08:00", tutup: "21:00" },
    Kamis: { aktif: false, buka: "08:00", tutup: "21:00" },
    Jumat: { aktif: false, buka: "08:00", tutup: "21:00" },
    Sabtu: { aktif: false, buka: "08:00", tutup: "21:00" },
    Minggu: { aktif: false, buka: "08:00", tutup: "21:00" },
  });

  const [ktpFile, setKtpFile] = useState(null);
  const [permitFile, setPermitFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCheckAll = (checked) => {
    const updatedHours = {};
    Object.keys(openingHours).forEach((day) => {
      updatedHours[day] = {
        ...openingHours[day],
        aktif: checked,
      };
    });
    setOpeningHours(updatedHours);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validasi
    if (!formData.name || !formData.address) {
      toast.error("Nama dan alamat barbershop wajib diisi.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!ktpFile || !permitFile) {
      toast.error("File KTP dan Surat Izin wajib diupload.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if at least one day is active
    const hasActiveDay = Object.values(openingHours).some((day) => day.aktif);
    if (!hasActiveDay) {
      toast.warning("Minimal satu hari harus aktif.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city); // ✅ Always Padang
      formDataToSend.append("opening_hours", JSON.stringify(openingHours));
      formDataToSend.append("ktp", ktpFile);
      formDataToSend.append("permit", permitFile);

      const response = await api.post("/barbershops/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Pendaftaran barbershop berhasil! Menunggu verifikasi admin.", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setTimeout(() => {
        navigate("/owner/my-barbershops");
      }, 2000);
    } catch (err) {
      console.error("Register barbershop error:", err);
      
      // ✅ Tampilkan pesan error spesifik dari backend menggunakan toast
      const errorMessage = err.response?.data?.message || 
                          "Gagal mendaftarkan barbershop. Silakan coba lagi.";
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Daftarkan Barbershop Anda
          </h1>
          <p className="text-gray-600 mb-6">
            Lengkapi form berikut untuk mendaftarkan barbershop Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Barbershop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Barbershop <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Contoh: Barbershop Modern"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Nama boleh sama dengan barbershop lain
              </p>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Contoh: Jl. Veteran No. 123, Kelurahan Padang Barat"
                required
              />
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Alamat tidak boleh sama dengan barbershop lain
              </p>
            </div>

            {/* Kota - Read Only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kota <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Saat ini sistem hanya tersedia untuk kota Padang
              </p>
            </div>

            {/* Jam Operasional */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Jam Operasional <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCheckAll(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Aktifkan Semua
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {Object.keys(openingHours).map((day, index) => (
                  <div
                    key={day}
                    className={`p-4 ${
                      index !== Object.keys(openingHours).length - 1
                        ? "border-b border-gray-200"
                        : ""
                    } ${openingHours[day].aktif ? "bg-blue-50" : "bg-white"}`}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center min-w-[120px]">
                        <input
                          type="checkbox"
                          id={`aktif-${day}`}
                          checked={openingHours[day].aktif}
                          onChange={(e) =>
                            handleScheduleChange(day, "aktif", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`aktif-${day}`}
                          className="ml-2 text-sm font-medium text-gray-800"
                        >
                          {day}
                        </label>
                      </div>

                      {openingHours[day].aktif && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Buka</label>
                            <input
                              type="time"
                              value={openingHours[day].buka}
                              onChange={(e) =>
                                handleScheduleChange(day, "buka", e.target.value)
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Tutup</label>
                            <input
                              type="time"
                              value={openingHours[day].tutup}
                              onChange={(e) =>
                                handleScheduleChange(day, "tutup", e.target.value)
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload KTP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload KTP Pemilik <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setKtpFile(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
              {ktpFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File terpilih: {ktpFile.name}
                </p>
              )}
            </div>

            {/* Upload Surat Izin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Surat Izin Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPermitFile(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
              {permitFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File terpilih: {permitFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Format yang diterima: JPG, PNG, atau PDF
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftarkan Barbershop"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterBarbershopPage;