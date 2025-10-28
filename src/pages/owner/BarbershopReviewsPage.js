// src/pages/owner/BarbershopReviewsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiArrowLeft, FiStar, FiFilter, FiTrendingUp } from 'react-icons/fi';

const BarbershopReviewsPage = () => {
    const { barbershopId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [stats, setStats] = useState({ 
        averageRating: 0, 
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [barbershopId]);

    useEffect(() => {
        // Filter reviews berdasarkan rating
        if (filterRating === 'all') {
            setFilteredReviews(reviews);
        } else {
            setFilteredReviews(reviews.filter(r => r.rating === parseInt(filterRating)));
        }
    }, [filterRating, reviews]);

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/owner/barbershop/${barbershopId}`);
            setReviews(response.data);
            
            // Calculate stats
            if (response.data.length > 0) {
                const total = response.data.reduce((sum, r) => sum + r.rating, 0);
                const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                
                response.data.forEach(r => {
                    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                });
                
                setStats({
                    averageRating: (total / response.data.length).toFixed(1),
                    totalReviews: response.data.length,
                    ratingDistribution: distribution
                });
            }
            setFilteredReviews(response.data);
        } catch (error) {
            toast.error('Gagal memuat review');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <FiStar
                key={i}
                className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                size={18}
            />
        ));
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-blue-600';
        if (rating >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <Link
                to="/owner/my-barbershops"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4"
            >
                <FiArrowLeft className="mr-2" />
                Kembali ke Daftar Barbershop
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Review Pelanggan</h1>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Average Rating Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rating Rata-rata</p>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className={`text-5xl font-bold ${getRatingColor(stats.averageRating)}`}>
                                    {stats.averageRating}
                                </span>
                                <div className="flex flex-col">
                                    <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                                    <p className="text-xs text-gray-500 mt-1">{stats.totalReviews} review</p>
                                </div>
                            </div>
                        </div>
                        <FiTrendingUp className="text-4xl text-yellow-500" />
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Distribusi Rating</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = stats.ratingDistribution[rating] || 0;
                            const percentage = stats.totalReviews > 0 
                                ? ((count / stats.totalReviews) * 100).toFixed(0) 
                                : 0;
                            
                            return (
                                <div key={rating} className="flex items-center space-x-3">
                                    <div className="flex items-center w-20">
                                        <span className="text-sm font-medium text-gray-700 mr-2">{rating}</span>
                                        <FiStar className="text-yellow-400 fill-current" size={16} />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-yellow-400 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-16 text-right">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <FiFilter className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Rating:</span>
                    <div className="flex space-x-2">
                        {['all', '5', '4', '3', '2', '1'].map(rating => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(rating)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filterRating === rating
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {rating === 'all' ? 'Semua' : `${rating} ⭐`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FiStar className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {reviews.length === 0 
                            ? 'Belum ada review dari pelanggan' 
                            : 'Tidak ada review dengan filter ini'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div key={review.review_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start space-x-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-lg font-bold text-indigo-600">
                                            {review.customer?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">
                                            {review.customer?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="text-lg font-bold text-gray-900">{review.rating}.0</span>
                                </div>
                            </div>

                            {review.title && (
                                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                                    {review.title}
                                </h3>
                            )}

                            {review.comment && (
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {review.comment}
                                </p>
                            )}

                            {/* Service Info */}
                            {review.Booking?.Service && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">Layanan:</span>
                                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                                {review.Booking.Service.name}
                                            </span>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                            review.status === 'approved' 
                                                ? 'bg-green-100 text-green-800'
                                                : review.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {review.status === 'approved' ? '✓ Disetujui' : review.status}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State Tips */}
            {reviews.length === 0 && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">💡 Tips Mendapatkan Review</h3>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                        <li>Berikan pelayanan terbaik kepada setiap pelanggan</li>
                        <li>Minta pelanggan untuk memberikan review setelah layanan selesai</li>
                        <li>Tanggapi setiap review dengan sopan dan profesional</li>
                        <li>Review positif akan meningkatkan kepercayaan pelanggan baru</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BarbershopReviewsPage;