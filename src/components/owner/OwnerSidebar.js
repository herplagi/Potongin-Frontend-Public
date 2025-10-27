// src/components/owner/OwnerSidebar.js - LENGKAP dengan import FiClock
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationBell from '../NotificationBell';
import { 
  FiHome, FiBarChart2, FiScissors, FiUsers, 
  FiCalendar, FiPlus, FiLogOut, 
  FiChevronDown, FiChevronRight, FiAlertCircle, FiImage, FiStar, FiFileText, FiClock // ✅ ADDED FiClock
} from 'react-icons/fi';

const OwnerSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState([]);
  const [expandedShops, setExpandedShops] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbershops = async () => {
      try {
        const response = await api.get('/barbershops/my-barbershops');
        setBarbershops(response.data);

        // Auto-expand barbershop yang sedang aktif di URL
        const urlBarbershopId = location.pathname.split('/')[3];
        if (urlBarbershopId) {
          setExpandedShops({ [urlBarbershopId]: true });
        }
      } catch (error) {
        console.error('Failed to fetch barbershops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbershops();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleShop = (shopId) => {
    setExpandedShops(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} font-medium`}>
        {badge.label}
      </span>
    );
  };

  const isActiveShop = (shopId) => location.pathname.includes(`/barbershop/${shopId}`);

  // ✅ UPDATED: Menu items dengan Schedule
  const menuItems = [
    { path: 'dashboard', icon: FiBarChart2, label: 'Dashboard' },
    { path: 'profile', icon: FiImage, label: 'Profil & Foto' },
    { path: 'schedule', icon: FiClock, label: 'Jadwal' }, // ✅ NEW
    { path: 'services', icon: FiScissors, label: 'Layanan' },
    { path: 'staff', icon: FiUsers, label: 'Staff' },
    { path: 'bookings', icon: FiCalendar, label: 'Booking' },
    { path: 'reviews', icon: FiStar, label: 'Review' },
    { path: 'reports', icon: FiFileText, label: 'Laporan' },
  ];

  const linkClasses = "flex items-center px-4 py-2 mt-2 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700";

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-800 overflow-visible relative z-30">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between relative">
        <div>
          <h2 className="text-3xl font-semibold text-white">Potong.in</h2>
          <p className="text-sm text-gray-400 mt-1">Owner Panel</p>
        </div>
        <div className="relative -mr-2">
          <NotificationBell />
        </div>
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
      <div className="flex-1">
        {/* My Barbershops Link */}
        <NavLink
          to="/owner/my-barbershops"
          className={({ isActive }) =>
            isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
          }
        >
          <FiHome className="w-5 h-5" />
          <span className="mx-4 font-medium">Daftar Barbershop</span>
        </NavLink>

        {/* Divider */}
        <div className="my-4 border-t border-gray-700"></div>

        {/* Loading State */}
        {loading && (
          <div className="py-4 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-2 text-xs">Loading...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && barbershops.length === 0 && (
          <div className="py-4 text-center">
            <FiAlertCircle className="mx-auto mb-2 text-gray-500" size={24} />
            <p className="text-xs text-gray-400">Belum ada barbershop</p>
          </div>
        )}

        {/* Barbershop List */}
        {!loading && barbershops.map((shop) => (
          <div key={shop.barbershop_id} className="mb-2">
            {/* Barbershop Header */}
            <button
              onClick={() => toggleShop(shop.barbershop_id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
                isActiveShop(shop.barbershop_id) ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {expandedShops[shop.barbershop_id] ? (
                  <FiChevronDown size={14} className="flex-shrink-0 text-gray-400" />
                ) : (
                  <FiChevronRight size={14} className="flex-shrink-0 text-gray-400" />
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate text-sm text-white">{shop.name}</p>
                  <div className="mt-1">
                    {getStatusBadge(shop.approval_status)}
                  </div>
                </div>
              </div>
            </button>

            {/* Submenu Items */}
            {expandedShops[shop.barbershop_id] && shop.approval_status === 'approved' && (
              <div className="ml-4 mt-1 space-y-1">
                {menuItems.map((item) => {
                  const path = `/owner/barbershop/${shop.barbershop_id}/${item.path}`;
                  const Icon = item.icon;
                  const isActive = location.pathname === path;
                  return (
                    <NavLink
                      key={item.path}
                      to={path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? 'bg-gray-600 text-white border-l-4 border-blue-500'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-2" size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}

            {/* Rejected Status Message */}
            {expandedShops[shop.barbershop_id] && shop.approval_status === 'rejected' && (
              <div className="ml-4 mt-2 p-3 bg-red-900/30 rounded-md">
                <p className="text-xs text-red-300 mb-2">Ditolak oleh admin</p>
                <NavLink
                  to={`/owner/barbershop/${shop.barbershop_id}/edit`}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded inline-block"
                >
                  Perbaiki Data
                </NavLink>
              </div>
            )}

            {/* Pending Status Message */}
            {expandedShops[shop.barbershop_id] && shop.approval_status === 'pending' && (
              <div className="ml-4 mt-2 p-3 bg-yellow-900/30 rounded-md">
                <p className="text-xs text-yellow-300">Menunggu persetujuan admin</p>
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-gray-700"></div>

        {/* Add New Barbershop Button */}
        <NavLink
          to="/register-barbershop"
          className="flex items-center px-4 py-2 mt-2 text-white bg-green-600 hover:bg-green-700 transition-colors rounded-md"
        >
          <FiPlus className="w-5 h-5" />
          <span className="mx-4 font-medium">Tambah Barbershop</span>
        </NavLink>
      </div>

      {/* Footer - Logout */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <button onClick={handleLogout} className={linkClasses}>
          <FiLogOut className="w-5 h-5" />
          <span className="mx-4 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerSidebar;