import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OwnerSidebar from './owner/OwnerSidebar';
import CustomerSidebar from './customer/CustomerSidebar';
import RoleSwitcher from './RoleSwitcher'; // ✅ NEW

const MainLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    // ✅ UPDATED: Sidebar based on URL path
    const renderSidebar = () => {
        // Show owner sidebar if URL contains /owner/
        if (location.pathname.includes('/owner/')) {
            return <OwnerSidebar />;
        }
        
        // Show customer sidebar for customer routes
        if (user?.is_customer) {
            return <CustomerSidebar />;
        }
        
        // Fallback to owner sidebar for pure owners
        if (user?.is_owner) {
            return <OwnerSidebar />;
        }
        
        return null;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* ✅ NEW: Role Switcher - Only shows for hybrid users */}
            <RoleSwitcher />
            
            {renderSidebar()}
            
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;