import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BarbershopCard = ({ shop }) => (
    <Link to={`/barbershops/detail/${shop.barbershop_id}`} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
        <h3 className="text-xl font-bold text-gray-800">{shop.name}</h3>
        <p className="mt-2 text-gray-600">{shop.address}, {shop.city}</p>
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

    if (loading) return <p className="p-8 text-center">Mencari barbershop terbaik...</p>;

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-center">Temukan Barbershop Terbaik di Kota Anda</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {barbershops.map(shop => <BarbershopCard key={shop.barbershop_id} shop={shop} />)}
            </div>
        </div>
    );
};

export default BarbershopListPage;