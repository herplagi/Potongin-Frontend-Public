// src/components/owner/OwnerSidebar.js - MODERN DESIGN
import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NotificationBell from "../NotificationBell";
import {
  FiHome,
  FiBarChart2,
  FiScissors,
  FiUsers,
  FiCalendar,
  FiPlus,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiImage,
  FiStar,
  FiFileText,
  FiClock,
  FiUser,
} from "react-icons/fi";

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
        const response = await api.get("/barbershops/my-barbershops");
        setBarbershops(response.data);

        const urlBarbershopId = location.pathname.split("/")[3];
        if (urlBarbershopId) {
          setExpandedShops({ [urlBarbershopId]: true });
        }
      } catch (error) {
        console.error("Failed to fetch barbershops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbershops();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleShop = (shopId) => {
    setExpandedShops((prev) => ({
      ...prev,
      [shopId]: !prev[shopId],
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        label: "Active",
      },
      pending: {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        label: "Pending",
      },
      rejected: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Rejected",
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} font-medium`}
      >
        {badge.label}
      </span>
    );
  };

  const isActiveShop = (shopId) =>
    location.pathname.includes(`/barbershop/${shopId}`);

  const menuItems = [
    { path: "dashboard", icon: FiBarChart2, label: "Dashboard" },
    { path: "profile", icon: FiImage, label: "Profil & Foto" },
    { path: "schedule", icon: FiClock, label: "Jadwal" },
    { path: "services", icon: FiScissors, label: "Layanan" },
    { path: "staff", icon: FiUsers, label: "Staff" },
    { path: "bookings", icon: FiCalendar, label: "Booking" },
    { path: "reviews", icon: FiStar, label: "Review" },
    { path: "reports", icon: FiFileText, label: "Laporan" },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-[#1a1d29] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {/* Header dengan Logo dan Notifikasi */}
      <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-bold text-lg">Potong.in</span>
        </div>
        <NotificationBell />
      </div>

      {/* User Profile Section */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 ring-4 ring-gray-800">
            <span className="text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base">
            {user?.name}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* MAIN SECTION */}
        <div className="mb-6">
          <div className="px-2 mb-3">
            <h2 className="text-[#fbbf24] text-xs font-bold uppercase tracking-wider">
              Main Menu
            </h2>
            {/* <p className="text-gray-500 text-xs mt-0.5">
              Quick access navigation
            </p> */}
          </div>

          <NavLink
            to="/owner/my-barbershops"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <FiHome className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">My Barbershops</span>
          </NavLink>

          <NavLink
            to="/owner/profile"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 mt-1 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <FiUser className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Profile Settings</span>
          </NavLink>
        </div>

        {/* BARBERSHOPS SECTION */}
        <div className="mb-6">
          <div className="px-2 mb-3">
            <h2 className="text-[#fbbf24] text-xs font-bold uppercase tracking-wider">
              Barbershops
            </h2>
            {/* <p className="text-gray-500 text-xs mt-0.5">
              Manage your barbershop locations
            </p> */}
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : barbershops.length === 0 ? (
            <div className="text-center py-4 px-3">
              <FiAlertCircle className="mx-auto text-gray-600 mb-2" size={24} />
              <p className="text-xs text-gray-500">No barbershops yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {barbershops.map((shop) => (
                <div key={shop.barbershop_id}>
                  {/* Barbershop Header */}
                  <button
                    onClick={() => toggleShop(shop.barbershop_id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActiveShop(shop.barbershop_id)
                        ? "bg-gray-800"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {expandedShops[shop.barbershop_id] ? (
                        <FiChevronDown
                          size={16}
                          className="flex-shrink-0 text-gray-400"
                        />
                      ) : (
                        <FiChevronRight
                          size={16}
                          className="flex-shrink-0 text-gray-400"
                        />
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium truncate text-sm text-gray-200">
                          {shop.name}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(shop.approval_status)}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Submenu Items */}
                  {expandedShops[shop.barbershop_id] &&
                    shop.approval_status === "approved" && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-gray-800 pl-3">
                        {menuItems.map((item) => {
                          const path = `/owner/barbershop/${shop.barbershop_id}/${item.path}`;
                          const Icon = item.icon;
                          const isActive = location.pathname === path;
                          return (
                            <NavLink
                              key={item.path}
                              to={path}
                              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                              }`}
                            >
                              <Icon className="mr-2.5" size={16} />
                              <span className="font-medium">{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}

                  {/* Rejected Status */}
                  {expandedShops[shop.barbershop_id] &&
                    shop.approval_status === "rejected" && (
                      <div className="ml-6 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400 mb-2">
                          Rejected by admin
                        </p>
                        <NavLink
                          to={`/owner/barbershop/${shop.barbershop_id}/edit`}
                          className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded inline-block transition-colors"
                        >
                          Fix Data
                        </NavLink>
                      </div>
                    )}

                  {/* Pending Status */}
                  {expandedShops[shop.barbershop_id] &&
                    shop.approval_status === "pending" && (
                      <div className="ml-6 mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-400">
                          Waiting for approval
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Barbershop */}
          <NavLink
            to="/register-barbershop"
            className="flex items-center px-3 py-2.5 mt-3 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 rounded-lg shadow-lg shadow-emerald-500/20"
          >
            <FiPlus className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Add Barbershop</span>
          </NavLink>
        </div>
      </div>

      {/* Footer - Logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 rounded-lg"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerSidebar;