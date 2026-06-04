import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';

// Sayfalar
import Layout from './components/Layout';
import Login from './pages/GirisEkrani';
import ResidentPanel from './pages/SakinPaneli';
import ResidentsList from './pages/SakinListesi';
import FinancialDashboard from './pages/FinansalDashboard';
import Requests from './pages/Talepler';
import Services from './pages/Hizmetler';
import Announcements from './pages/Duyurular';
import AdminPanel from './pages/YoneticiPaneli';

// ── Korumalı Rota: Giriş yapılmamışsa /login'e yönlendir ───────────────
function PrivateRoute({ children }) {
  const { isAuthenticated } = useContext(AppContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── Yönetici Korumalı Rota: Sadece yöneticiler erişebilir ──────────────
function AdminRoute({ children }) {
  const { isAuthenticated, currentRole } = useContext(AppContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentRole !== 'yonetici') return <Navigate to="/resident" replace />;
  return children;
}

// ── Giriş Yapmış Kullanıcıyı /login'den Yönlendir ─────────────────────
function GuestRoute({ children }) {
  const { isAuthenticated, currentRole } = useContext(AppContext);
  if (isAuthenticated) {
    return <Navigate to={currentRole === 'yonetici' ? '/admin' : '/resident'} replace />;
  }
  return children;
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Giriş Sayfası — giriş yapmışsa panele yönlendir */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          {/* Korumalı Sayfalar — tüm kullanıcılar erişebilir (giriş şartıyla) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Varsayılan: role göre yönlendir */}
            <Route index element={<RoleRedirect />} />

            {/* Sakin & Yönetici erişimi */}
            <Route path="resident"      element={<ResidentPanel />} />
            <Route path="services"      element={<Services />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="requests"      element={<Requests />} />

            {/* Sadece Yönetici erişimi */}
            <Route path="residents-list" element={<AdminRoute><ResidentsList /></AdminRoute>} />
            <Route path="financial"      element={<AdminRoute><FinancialDashboard /></AdminRoute>} />
            <Route path="admin"          element={<AdminRoute><AdminPanel /></AdminRoute>} />
          </Route>

          {/* Bilinmeyen rotalar: giriş sayfasına */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

// Role göre ana sayfaya yönlendirme
function RoleRedirect() {
  const { currentRole } = useContext(AppContext);
  return <Navigate to={currentRole === 'yonetici' ? '/admin' : '/resident'} replace />;
}

export default App;
