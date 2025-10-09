import React from 'react';
import { Outlet } from 'react-router-dom';
import OwnerSidebar from './OwnerSidebar';

const OwnerLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Bagian Sidebar yang akan selalu tampil */}
            <OwnerSidebar />

            {/* Bagian Konten Utama */}
            <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                {/* Outlet adalah komponen penting dari React Router.
                  Di sinilah komponen halaman (seperti OwnerDashboardPage, 
                  ManageServicesPage, dll.) akan dirender secara dinamis 
                  sesuai dengan URL yang aktif.
                */}
                <Outlet />
            </main>
        </div>
    );
};

export default OwnerLayout;