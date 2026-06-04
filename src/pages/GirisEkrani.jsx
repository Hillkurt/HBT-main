import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Eye, EyeOff, Building, Shield, AlertCircle, User, Lock, Wifi, WifiOff, CheckSquare, Square } from 'lucide-react';

export default function GirisEkrani() {
  // login fonksiyonu artık async — backend varsa sunucuya, yoksa mock'a bağlanır
  const { login, backendOnline, backendChecked } = useContext(AppContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Beni hatırla varsa başlangıçta yükle
  useEffect(() => {
    const savedUser = localStorage.getItem('hbt_saved_username');
    const savedPass = localStorage.getItem('hbt_saved_password');
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  // async handleSubmit: login fonksiyonu artık Promise döndürüyor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // login() artık async — backend çevrimiçiyse sunucudan, değilse mock'tan yanıt alır
      const result = await login(username, password);
      setLoading(false);

      if (result.success) {
        // Beni hatırla seçiliyse bilgileri kaydet (Sunum demosu için şifre de kaydediliyor)
        if (rememberMe) {
          localStorage.setItem('hbt_saved_username', username);
          localStorage.setItem('hbt_saved_password', password);
        } else {
          localStorage.removeItem('hbt_saved_username');
          localStorage.removeItem('hbt_saved_password');
        }

        // Role göre yönlendir: yönetici → /admin, sakin → /resident
        navigate(result.role === 'yonetici' ? '/admin' : '/resident', { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  // Hızlı giriş demo hesapları — sunum için kolaylık
  const quickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1A237E] to-[#1e3a8a] flex items-center justify-center p-4">
      
      {/* Arkaplan dekoratif daireler */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-xl">
            <Building size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dijital Yönetim</h1>
          <p className="text-blue-200/70 text-sm mt-1">Apartman & Site Yönetim Sistemi</p>
        </div>

        {/* Giriş Kartı */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Sisteme Giriş Yap</h2>
          <p className="text-blue-200/60 text-xs mb-6">Kullanıcı adı ve şifrenizi girin</p>

          {/* Hata Mesajı */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-semibold px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-xs font-semibold text-blue-200/80 mb-1.5">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <User size={15} />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-xs font-semibold text-blue-200/80 mb-1.5">Şifre</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={15} />
                </div>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla Seçeneği */}
            <div className="flex items-center mt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-blue-200/80 hover:text-white transition-colors"
              >
                {rememberMe ? (
                  <CheckSquare size={16} className="text-blue-400" />
                ) : (
                  <Square size={16} className="text-white/40" />
                )}
                <span className="text-xs font-medium cursor-pointer">Beni Hatırla</span>
              </button>
            </div>

            {/* Giriş Butonu */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Hızlı Demo Giriş */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] text-blue-200/50 text-center mb-3 font-medium uppercase tracking-wider">Demo Hesapları</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('hilal.kurt', '1234')}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white/90">Sakin Girişi</p>
                  <p className="text-[10px] text-white/40">hilal.kurt</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('yonetici', 'admin123')}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={13} className="text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white/90">Yönetici Girişi</p>
                  <p className="text-[10px] text-white/40">yonetici</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Alt bilgi + Backend Durum Göstergesi */}
        <div className="mt-6 flex flex-col items-center gap-2">
          {/* Backend bağlantı rozeti — sunum için harika! */}
          {backendChecked && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-sm border ${
              backendOnline
                ? 'bg-green-500/10 border-green-400/30 text-green-300'
                : 'bg-orange-500/10 border-orange-400/30 text-orange-300'
            }`}>
              {backendOnline
                ? <><Wifi size={11} /> Backend Bağlı (localhost:8000)</>
                : <><WifiOff size={11} /> Çevrimdışı · Mock Mod</>
              }
            </div>
          )}
          <p className="text-center text-blue-300/30 text-[11px]">
            © 2026 Dijital Yönetim · Ankara Medipol Üniversitesi
          </p>
        </div>
      </div>
    </div>
  );
}
