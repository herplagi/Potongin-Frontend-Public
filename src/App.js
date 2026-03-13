import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout & Wrapper
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Halaman Publik
import BarbershopListPage from "./pages/public/BarbershopListPage";
import BarbershopDetailPage from "./pages/public/BarbershopDetailPage";

// Halaman Autentikasi
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Halaman Customer
import DashboardPage from "./pages/DashboardPage";
import MyBookingsPage from "./pages/customer/MyBookingsPage";

// Halaman Owner
import RegisterBarbershopPage from "./pages/owner/RegisterBarbershopPage";
import MyBarbershopsPage from "./pages/owner/MyBarbershopsPage";
import EditBarbershopPage from "./pages/owner/EditBarbershopPage";
import ManageServicesPage from "./pages/owner/ManageServicesPage";
import ManageStaffPage from "./pages/owner/ManageStaffPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import ManageBookingsPage from "./pages/owner/ManageBookingsPage";
import BarbershopProfilePage from "./pages/owner/BarbershopProfilePage";
import BarbershopReviewsPage from "./pages/owner/BarbershopReviewsPage";
import TransactionReportPage from "./pages/owner/TransactionReportPage";
import ManageSchedulePage from "./pages/owner/ManageSchedulePage";
import OwnerProfilePage from "./pages/owner/OwnerProfilePage";
import OwnerChangePasswordPage from "./pages/owner/OwnerChangePasswordPage";

const OwnerOnlyElement = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user?.is_owner) {
    return <Navigate to="/register-barbershop" replace />;
  }

  return element;
};

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.is_owner) {
    return <Navigate to="/owner/my-barbershops" replace />;
  }

  if (user.is_customer) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* --- Rute Publik (Bisa diakses siapa saja) --- */}
        <Route path="/barbershops" element={<BarbershopListPage />} />
        <Route
          path="/barbershops/detail/:id"
          element={<BarbershopDetailPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* --- Grup Rute Terlindungi (Harus Login & Punya Sidebar) --- */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Customer Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />

          {/* Owner Routes - Pendaftaran Barbershop */}
          <Route
            path="/register-barbershop"
            element={<RegisterBarbershopPage />}
          />

          {/* Owner Routes - Daftar Barbershop */}
          <Route
            path="/owner/my-barbershops"
            element={<OwnerOnlyElement element={<MyBarbershopsPage />} />}
          />

          {/* Owner Routes - Kelola Barbershop Spesifik */}
          <Route
            path="/owner/barbershop/:barbershopId/dashboard"
            element={<OwnerOnlyElement element={<OwnerDashboardPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/edit"
            element={<OwnerOnlyElement element={<EditBarbershopPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/services"
            element={<OwnerOnlyElement element={<ManageServicesPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/staff"
            element={<OwnerOnlyElement element={<ManageStaffPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/bookings"
            element={<OwnerOnlyElement element={<ManageBookingsPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/profile"
            element={<OwnerOnlyElement element={<BarbershopProfilePage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/reviews"
            element={<OwnerOnlyElement element={<BarbershopReviewsPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/reports"
            element={<OwnerOnlyElement element={<TransactionReportPage />} />}
          />
          <Route
            path="/owner/barbershop/:barbershopId/schedule"
            element={<OwnerOnlyElement element={<ManageSchedulePage />} />}
          />
          {/* Owner Profile Routes */}
          <Route path="/owner/profile" element={<OwnerOnlyElement element={<OwnerProfilePage />} />} />
          <Route
            path="/owner/change-password"
            element={<OwnerOnlyElement element={<OwnerChangePasswordPage />} />}
          />
        </Route>

        {/* --- Rute Default & Catch-all --- */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toast Notifications Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
