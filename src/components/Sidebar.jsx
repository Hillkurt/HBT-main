import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building, 
  Wallet, 
  Users, 
  ClipboardList, 
  Wrench, 
  Bell, 
  LayoutDashboard,
  Shield,
  Home,
  Layers,
  Moon,
  Sun
} from 'lucide-react';
import clsx from 'clsx';
import { AppContext } from '../context/AppContext';

// Tüm menü öğeleri — her birinde hangi rollerin göreceği tanımlandı
const allNavItems = [
  { name: 'Sakin Paneli',   icon: Home,           path: '/resident',       roles: ['sakin', 'yonetici'] },
  { name: 'Hizmet Takibi',  icon: Building,       path: '/services',       roles: ['sakin', 'yonetici'] },
  { name: 'Duyurular',      icon: Bell,           path: '/announcements',  roles: ['sakin', 'yonetici'] },
  { name: 'Talep Takibi',   icon: Wrench,         path: '/requests',       roles: ['sakin', 'yonetici'] },
  { name: 'Sakin Listesi',  icon: ClipboardList,  path: '/residents-list', roles: ['yonetici'] },
  { name: 'Finans',         icon: Wallet,         path: '/financial',      roles: ['yonetici'] },
  { name: 'Yönetim Paneli', icon: LayoutDashboard,path: '/admin',          roles: ['yonetici'] },
];

export default function Sidebar() {
  const { currentRole, currentUser, isDarkMode, toggleTheme } = useContext(AppContext);

  // Mevcut role göre görünür menüleri filtrele
  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));

  const isAdmin = currentRole === 'yonetici';

  return (
    <aside className="w-64 bg-[var(--primary)] text-white h-screen flex flex-col fixed left-0 top-0 shadow-2xl transition-colors duration-300 z-50">
      
      {/* Logo ve Uygulama İsmi */}
      <div className="p-6 flex items-center gap-4 border-b border-white/10 relative overflow-hidden">
        {/* Arka plan neon parlaması */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#00E5FF] rounded-full mix-blend-screen opacity-20 blur-xl"></div>
        
        <div className="w-16 h-16 flex shrink-0 items-center justify-center relative z-10">
          <img src="/logo.png" alt="HBT Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]" />
        </div>
        <div className="flex flex-col justify-center relative z-10">
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00E5FF] leading-none pb-1 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">HBT</h1>
          <p className="text-sm text-blue-200/90 font-medium leading-tight tracking-wide">Dijital Yönetim<br/>Sistemi</p>
        </div>
      </div>

      {/* Rol Rozeti */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
          isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'
        }`}>
          <Shield size={13} />
          {isAdmin ? 'Yönetici Modu' : 'Sakin Modu'}
        </div>
      </div>

      {/* Navigasyon Menüsü */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive
                  ? "bg-white/15 text-white font-semibold shadow-sm"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              )
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Alt: Kullanıcı Bilgisi ve Tema Değiştirici */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
            {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-white/50 truncate">{currentUser?.unit}</p>
          </div>
        </div>
        
        {/* Tema Değiştirici Buton */}
        <button 
          onClick={toggleTheme}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/20 text-white transition-colors"
          title={isDarkMode ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
}
