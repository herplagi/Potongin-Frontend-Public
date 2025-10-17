import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const BarbershopDetailPage = () => {
    const { id } = useParams();
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/barbershops/detail/${id}`);
                setBarbershop(response.data);
            } catch (error) {
                console.error("Gagal memuat detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <p className="p-8 text-center">Loading...</p>;
    if (!barbershop) return <p className="p-8 text-center">Barbershop tidak ditemukan.</p>;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-gray-900">{barbershop.name}</h1>
                <p className="mt-2 text-lg text-gray-600">{barbershop.address}, {barbershop.city}</p>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Pilih Layanan</h2>
                <div className="mt-6 space-y-4">
                    {barbershop.services && barbershop.services.length > 0 ? (
                        barbershop.services.map(service => (
                            <div key={service.service_id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{service.name}</h3>
                                    <p className="text-sm text-gray-500">{service.description}</p>
                                    <p className="text-sm text-gray-500 mt-1">Durasi: {service.duration_minutes} menit</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">Rp {Number(service.price).toLocaleString('id-ID')}</p>
                                    <button className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        Pesan
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Saat ini belum ada layanan yang tersedia.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarbershopDetailPage;