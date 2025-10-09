import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet, // Impor Outlet untuk layout terproteksi
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts & Wrapper
import OwnerLayout from "./components/owner/OwnerLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Halaman Publik
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Halaman Customer
import CustomerDashboardPage from "./pages/customer/CustomerDashboardPage";

// Halaman Owner
import RegisterBarbershopPage from "./pages/owner/RegisterBarbershopPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import MyBarbershopsPage from "./pages/owner/MyBarbershopsPage"; // <-- Impor halaman baru
import ManageServicesPage from "./pages/owner/ManageServicesPage";
import ManageStaffPage from "./pages/owner/ManageStaffPage";
import EditBarbershopPage from './pages/owner/EditBarbershopPage';

// Komponen untuk mengarahkan pengguna setelah login berdasarkan peran
const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "owner") return <Navigate to="/owner/dashboard" />;
  if (user?.role === "customer") return <Navigate to="/customer/dashboard" />;
  return <Navigate to="/login" />;
};

// Komponen Wrapper untuk semua rute yang membutuhkan login
// Ini membuat kode lebih bersih daripada membungkus setiap rute satu per satu
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

// Komponen yang berisi semua logika routing
const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl">Loading Aplikasi...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rute Publik (Bisa diakses tanpa login) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Grup Rute Terlindungi --- */}
        {/* Semua rute di dalam sini akan dicek oleh ProtectedRoute terlebih dahulu */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/register-barbershop" element={<RegisterBarbershopPage />} />

          {/* Grup Rute Khusus Owner dengan Layout Sidebar */}
          <Route element={<OwnerLayout />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/my-barbershops" element={<MyBarbershopsPage />} />
            <Route path="/owner/barbershop/:barbershopId/edit" element={<EditBarbershopPage />} />
            <Route
              path="/owner/barbershop/:barbershopId/services"
              element={<ManageServicesPage />}
            />
            {/* --- PERBAIKAN DI SINI --- */}
            <Route
              path="/owner/barbershop/:barbershopId/staff" 
              element={<ManageStaffPage />}
            />
          </Route>
        </Route>
        
        {/* Rute Catch-all untuk halaman yang tidak ditemukan, arahkan ke halaman utama */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Komponen App paling atas yang membungkus semuanya
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;