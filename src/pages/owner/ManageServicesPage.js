import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiScissors,
} from "react-icons/fi";

const ManageServicesPage = () => {
  // 1. Ambil ID Barbershop dari URL
  const { barbershopId } = useParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' atau 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentService, setCurrentService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });

  // Fungsi untuk mengambil data layanan dari backend
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/barbershops/${barbershopId}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error("Gagal memuat layanan untuk barbershop ini.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Fungsi untuk membuka modal
  const openModal = (mode, service = null) => {
    setModalMode(mode);
    if (mode === "edit" && service) {
      setCurrentService(service);
    } else {
      setCurrentService({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Fungsi untuk menangani perubahan pada input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk submit form (menambah atau mengedit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const endpoint =
      modalMode === "add"
        ? `/barbershops/${barbershopId}/services`
        : `/barbershops/${barbershopId}/services/${currentService.service_id}`;

    const method = modalMode === "add" ? "post" : "put";

    try {
      await api[method](endpoint, currentService);
      toast.success(
        `Layanan berhasil di-${modalMode === "add" ? "tambahkan" : "perbarui"}!`
      );
      fetchServices(); // Ambil ulang data terbaru
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menonaktifkan layanan (soft delete)
  const handleDeactivate = async (serviceId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menonaktifkan layanan ini? Data tidak akan hilang permanen."
      )
    ) {
      try {
        await api.delete(`/barbershops/${barbershopId}/services/${serviceId}`);
        toast.success("Layanan berhasil dinonaktifkan.");
        fetchServices(); // Ambil ulang data terbaru
      } catch (error) {
        toast.error("Gagal menonaktifkan layanan.");
      }
    }
  };

  // Helper function untuk merender konten utama
  const renderContent = () => {
    if (loading) {
      return (
        <p className="text-center mt-8 text-gray-500">
          Memuat daftar layanan...
        </p>
      );
    }

    if (services.length === 0) {
      return (
        <div className="text-center mt-12 py-16 border-2 border-dashed rounded-lg">
          <FiScissors className="mx-auto text-6xl text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">
            Anda Belum Memiliki Layanan
          </h3>
          <p className="mt-2 text-gray-500">
            Tambahkan layanan pertama Anda untuk mulai menerima booking.
          </p>
          <button
            onClick={() => openModal("add")}
            className="mt-6 flex items-center mx-auto px-5 py-2.5 text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Tambah Layanan Pertama Anda
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Layanan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durasi
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr
                key={service.service_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {service.name}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {service.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">
                  Rp {Number(service.price).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {service.duration_minutes} Menit
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => openModal("edit", service)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeactivate(service.service_id)}
                      className="text-red-600 hover:text-red-900"
                      title="Nonaktifkan"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <Link
        to="/owner/my-barbershops"
        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Kembali ke Daftar Barbershop
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Layanan</h1>
        {services.length > 0 && (
          <button
            onClick={() => openModal("add")}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow"
          >
            <FiPlus className="mr-2" /> Tambah Layanan Baru
          </button>
        )}
      </div>

      {renderContent()}

      {/* Modal untuk Tambah/Edit Layanan */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-900"
                >
                  {modalMode === "add" ? "Tambah Layanan Baru" : "Edit Layanan"}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Layanan
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={currentService.name}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={currentService.description}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Harga (Rp)
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        value={currentService.price}
                        onChange={handleChange}
                        placeholder="50000"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="duration_minutes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Durasi (Menit)
                      </label>
                      <input
                        id="duration_minutes"
                        name="duration_minutes"
                        type="number"
                        value={currentService.duration_minutes}
                        onChange={handleChange}
                        placeholder="45"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ManageServicesPage;
