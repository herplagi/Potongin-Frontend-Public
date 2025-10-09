import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RxDashboard } from "react-icons/rx";
import { FiLogOut, FiHome } from "react-icons/fi";

const OwnerSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- Gunakan kelas CSS yang sama persis dari AdminSidebar ---
  const linkClasses =
    "flex items-center px-4 py-2 mt-2 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700";
  // --------------------------------------------------------

  return (
    // Gunakan struktur div dan padding yang sama dari AdminSidebar
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-800">
      <h2 className="text-3xl font-semibold text-white">Owner Panel</h2>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <NavLink
            to="/owner/dashboard"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <RxDashboard className="w-5 h-5" />
            <span className="mx-4 font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/owner/my-barbershops"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <FiHome className="w-5 h-5" />
            <span className="mx-4 font-medium">Barbershop Saya</span>
          </NavLink>
        </nav>

        {/* Tombol Logout juga menggunakan kelas yang sama */}
        <div>
          <button onClick={handleLogout} className={linkClasses}>
            <FiLogOut className="w-5 h-5" />
            <span className="mx-4 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerSidebar;