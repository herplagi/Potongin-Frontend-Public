import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BarbershopCard = ({ shop }) => (
  <Link
    to={`/barbershops/detail/${shop.barbershop_id}`}
    className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
  >
    <div className="p-5">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{shop.name}</h3>
        {shop.rating !== undefined && (
          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            ★ {shop.rating}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{shop.address}, {shop.city}</p>
      {shop.distance && (
        <p className="mt-2 text-xs text-gray-500">≈ {shop.distance} km dari lokasi Anda</p>
      )}
    </div>
  </Link>
);

const BarbershopListPage = () => {
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbershops = async () => {
      try {
        const response = await api.get('/barbershops');
        setBarbershops(response.data);
      } catch (error) {
        console.error("Gagal memuat barbershop:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbershops();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Mencari barbershop terbaik...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Temukan Barbershop Terbaik di Kota Anda
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Pilih dari ratusan barbershop terpercaya dengan ulasan pelanggan dan layanan profesional.
          </p>
        </div>

        {barbershops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada barbershop yang ditemukan di sekitar Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {barbershops.map((shop) => (
              <BarbershopCard key={shop.barbershop_id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarbershopListPage;