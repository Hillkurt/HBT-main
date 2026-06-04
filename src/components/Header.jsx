import React, { useContext } from 'react';
import { Menu, MessageSquare, Bell, User, Shield, LogOut } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { 
    currentRole, setCurrentRole, currentUser, 
    announcements, requests, logout, isAuthenticated 
  } = useContext(AppContext);
  const navigate = useNavigate();

  // Acil duyurular ve beklemedeki taleplerin toplamı
  const urgentAnnouncements = announcements.filter(a => a.priority === 'Yüksek' || a.category === 'Acil').length;
  const pendingRequests     = requests.filter(r => r.status === 'Beklemede').length;
  const notificationCount   = urgentAnnouncements + pendingRequests;

  // Rol değiştirici — sadece geliştirme/demo amaçlı; yönetici girişindeyse sakin moduna geçiş kapalı
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    navigate(role === 'sakin' ? '/resident' : '/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-[var(--bg-card)] flex items-center justify-between px-6 border-b border-[var(--border-light)] shadow-sm sticky top-0 z-10 transition-colors duration-300">
      
      {/* Sol: Aktif Görünüm Rozeti */}
      <div className="flex items-center gap-4">
        <button className="text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] p-2 rounded-lg transition-colors sm:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            Aktif Görünüm: {currentRole === 'sakin' ? 'Bina Sakini' : 'Bina Yöneticisi'}
          </span>
        </div>
      </div>

      {/* Sağ: İşlemler */}
      <div className="flex items-center gap-3">

        {/* Rol Değiştirici — sadece yönetici girişinde (demo amaçlı) göster */}
        {currentRole === 'yonetici' && (
          <div className="flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-light)]">
            <button
              onClick={() => handleRoleChange('sakin')}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Sakin
            </button>
            <button
              onClick={() => handleRoleChange('yonetici')}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all bg-[#1A237E] text-white shadow-sm"
            >
              Yönetici
            </button>
          </div>
        )}

        {/* Mesajlar */}
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-subtle)]">
          <MessageSquare size={20} />
        </button>

        {/* Bildirimler */}
        <button
          onClick={() => navigate(currentRole === 'sakin' ? '/announcements' : '/requests')}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-subtle)] relative"
          title={`${urgentAnnouncements} Acil Duyuru, ${pendingRequests} Bekleyen Talep`}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Kullanıcı Profili */}
        <div
          onClick={() => navigate(currentRole === 'sakin' ? '/resident' : '/admin')}
          className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-subtle)] px-3 py-2 rounded-xl transition-colors border border-[var(--border-light)]"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentRole === 'sakin' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {currentRole === 'sakin' ? <User size={16} /> : <Shield size={16} />}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">
              {currentRole === 'sakin' ? currentUser?.name : 'Yönetici'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] leading-none mt-1">
              {currentRole === 'sakin' ? currentUser?.unit : 'Yönetim Modu'}
            </p>
          </div>
        </div>

        {/* Çıkış Butonu */}
        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={15} />
          <span className="hidden md:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
}
