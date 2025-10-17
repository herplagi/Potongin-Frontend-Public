import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RxDashboard } from "react-icons/rx";
import { FiLogOut, FiList, FiHome, FiPlus } from "react-icons/fi";

const CustomerSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClasses = "flex items-center px-4 py-2 mt-2 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-gray-700";
    const activeLinkClasses = "bg-gray-700";

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-800">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-semibold text-white">Potong.in</h2>
                <p className="text-sm text-gray-400 mt-1">Customer Area</p>
            </div>

            {/* User Info */}
            <div className="mb-6 pb-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-lg text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex flex-col justify-between flex-1">
                <nav>
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
                    >
                        <RxDashboard className="w-5 h-5" />
                        <span className="mx-4 font-medium">Dashboard</span>
                    </NavLink>

                    <NavLink 
                        to="/barbershops" 
                        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
                    >
                        <FiHome className="w-5 h-5" />
                        <span className="mx-4 font-medium">Cari Barbershop</span>
                    </NavLink>
                    
                    <NavLink 
                        to="/my-bookings" 
                        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
                    >
                        <FiList className="w-5 h-5" />
                        <span className="mx-4 font-medium">Booking Saya</span>
                    </NavLink>

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-700"></div>

                    {/* Call to Action - Jadi Owner */}
                    <div className="p-4 bg-gradient-to-br from-green-600 to-green-700 rounded-lg mt-4">
                        <h3 className="text-sm font-bold text-white mb-1">
                            Punya Bisnis Barbershop?
                        </h3>
                        <p className="text-xs text-green-100 mb-3">
                            Daftarkan dan kelola barbershop Anda
                        </p>
                        <NavLink
                            to="/register-barbershop"
                            className="flex items-center justify-center w-full px-3 py-2 text-sm font-semibold bg-white text-green-700 rounded-md hover:bg-green-50 transition-colors"
                        >
                            <FiPlus className="mr-2" size={16} />
                            Daftar Sekarang
                        </NavLink>
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <button onClick={handleLogout} className={linkClasses}>
                        <FiLogOut className="w-5 h-5" />
                        <span className="mx-4 font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerSidebar