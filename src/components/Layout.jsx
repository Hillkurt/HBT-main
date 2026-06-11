import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppContext } from '../context/AppContext';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// Global Toast Bileşeni
function GlobalToast() {
  const { toast } = useContext(AppContext);
  if (!toast.show) return null;

  const configs = {
    success: { bg: 'bg-gray-800', icon: Check,        iconBg: 'bg-green-500',  text: 'text-green-400' },
    error:   { bg: 'bg-gray-800', icon: X,            iconBg: 'bg-red-500',    text: 'text-red-400'   },
    info:    { bg: 'bg-gray-800', icon: Info,         iconBg: 'bg-blue-500',   text: 'text-blue-400'  },
    warning: { bg: 'bg-gray-800', icon: AlertCircle,  iconBg: 'bg-amber-500',  text: 'text-amber-400' },
  };
  const cfg = configs[toast.type] || configs.success;
  const Icon = cfg.icon;

  return (
    <div className={`fixed bottom-6 right-6 ${cfg.bg} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-bounce-in max-w-sm`}
         style={{ animation: 'slideInUp 0.3s ease-out' }}>
      <div className={`${cfg.iconBg} rounded-full p-1.5 flex-shrink-0`}>
        <Icon size={13} className="text-white" />
      </div>
      <span className="text-xs font-semibold leading-snug">{toast.message}</span>
    </div>
  );
}

// Tüm sayfaların iskeletini (Layout) oluşturan bileşen
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Ekranın tamamını kaplayan, arka plan rengine sahip ana kapsayıcı
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden transition-colors duration-300">
      
      {/* Sol taraftaki navigasyon menüsü — mobilde açılıp kapanır */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Sağ taraftaki ana içerik alanı */}
      {/* Desktop: ml-64 (sidebar genişliği kadar boşluk) */}
      {/* Mobil: ml-0 (sidebar overlay olarak açılır) */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 overflow-hidden">
        
        {/* Üst bilgi çubuğu (Kullanıcı profili, bildirimler vb.) */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Sayfaların değişen içeriklerinin yüklendiği ana kaydırılabilir alan */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* React Router Outlet: Geçerli url'ye göre değişen sayfayı buraya çizer */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Bildirim (Toast) — tüm sayfalar için */}
      <GlobalToast />
    </div>
  );
}
