import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShoppingBag } from 'react-icons/fi';

const RoleSwitcher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show if user has BOTH roles
  if (!user?.is_customer || !user?.is_owner) {
    return null;
  }

  const isOwnerMode = location.pathname.includes('/owner/');

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-1 flex gap-1">
      <button
        onClick={() => navigate('/dashboard')}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
          !isOwnerMode
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="Switch to Customer Mode"
      >
        <FiUser className="mr-2" size={16} />
        Customer
      </button>
      <button
        onClick={() => navigate('/owner/my-barbershops')}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isOwnerMode
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="Switch to Owner Mode"
      >
        <FiShoppingBag className="mr-2" size={16} />
        Owner
      </button>
    </div>
  );
};

export default RoleSwitcher;