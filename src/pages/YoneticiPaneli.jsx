import React, { useContext, useState } from 'react';
import {
  Users, Wrench, AlertTriangle, Wallet, ArrowRight, Play,
  ShieldAlert, Settings, Terminal, Check, Info, BellRing, Sparkles, X
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function YoneticiPaneli() {
  const {
    residents, requests, transactions, logs, generateMonthlyDues,
    currentRole, setCurrentRole, showNotification
  } = useContext(AppContext);

  const navigate = useNavigate();

  // Toplu Aidat Borçlandırma Modal State
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [duesAmount, setDuesAmount] = useState('1200');

  // Toplu aidat borçlandırması işlemi
  const handleGenerateDues = (e) => {
    e.preventDefault();
    const amount = Number(duesAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Lütfen geçerli bir aidat tutarı giriniz.');
      return;
    }
    generateMonthlyDues(amount);
    setShowDuesModal(false);
    showNotification(`Tüm sakinler için ${amount} TL yeni ay aidat borçlandırılması tanımlandı.`, 'success');
  };

  // Toplu SMS / E-posta Hatırlatma Simülasyonu
  const handleSendAllReminders = () => {
    const outstandingCount = residents.filter(r => r.dues > 0).length;
    if (outstandingCount === 0) {
      showNotification('Gecikmiş borcu olan daire bulunmuyor.', 'info');
      return;
    }
    showNotification(`Borcu bulunan ${outstandingCount} daire sakinine otomatik SMS ve E-posta uyarısı gönderildi.`, 'success');
  };

  // Sakin Modundayken Uyarı Göster
  if (currentRole === 'sakin') {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Yönetici Yetkisi Gereklidir</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Şu an <strong>Bina Sakini</strong> modundasınız. Yönetim Panelini görüntülemek, aidat tanımlamak ve sistem günlüklerini incelemek için lütfen üst çubuktaki <strong>Yönetici</strong> butonuna tıklayarak rolünüzü değiştirin.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentRole('yonetici');
            navigate('/admin');
          }}
          className="bg-[#1A237E] hover:bg-[#151c66] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
        >
          Yönetici Moduna Geç <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // Yönetici İstatistik Hesaplamaları
  const totalResidents = residents.length;
  const pendingRequests = requests.filter(r => r.status === 'Beklemede').length;
  const unpaidCount = residents.filter(r => r.dues > 0).length;
  const totalOutstandingDues = residents.reduce((acc, r) => acc + r.dues, 0);

  return (
    <div className="space-y-6">

      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Yönetim Paneli (Admin Kontrol Merkezi)</h2>
        <p className="text-xs text-[var(--text-muted)]">Apartman geneli durum istatistiklerini, toplu işlemleri ve sistem loglarını buradan yönetin</p>
      </div>

      {/* 4'lü İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Kart 1: Kayıtlı Sakinler */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Kayıtlı Daire / Sakin</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{totalResidents}</p>
          </div>
        </div>

        {/* Kart 2: Bekleyen Talepler */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Bekleyen Talep</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{pendingRequests}</p>
          </div>
        </div>

        {/* Kart 3: Borçlu Daireler */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Borçlu Daire Sayısı</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{unpaidCount}</p>
          </div>
        </div>

        {/* Kart 4: Toplam Geciken Alacak */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Geciken Toplam Alacak</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{totalOutstandingDues.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol 2 Sütun: Yönetimsel Toplu İşlemler */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Toplu Yönetimsel İşlemler</h3>
              <p className="text-[10px] text-[var(--text-muted)]">Tek tıkla tüm bina sakinlerini borçlandırın veya hatırlatma gönderin</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aidat Tanımlama */}
              <div className="border border-[var(--border-light)] rounded-xl p-4 flex flex-col justify-between hover:border-blue-100 transition-colors">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-500" />
                    Yeni Ay Aidatı Borçlandır
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] leading-normal">
                    Bina sakinlerinin tamamı için aidat dönemi borçlandırması gerçekleştirir. Mevcut borçlarına eklenir.
                  </p>
                </div>
                <button
                  onClick={() => setShowDuesModal(true)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-[11px] transition-colors"
                >
                  Aidat Tanımla
                </button>
              </div>

              {/* Toplu Hatırlatma SMS */}
              <div className="border border-[var(--border-light)] rounded-xl p-4 flex flex-col justify-between hover:border-orange-100 transition-colors">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <BellRing size={14} className="text-orange-400" />
                    Toplu Borç Hatırlatması Gönder
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] leading-normal">
                    Şu anda gecikmiş aidat borcu olan ({unpaidCount}) daireye SMS ve E-posta yoluyla otomatik ödeme uyarısı simüle eder.
                  </p>
                </div>
                <button
                  onClick={handleSendAllReminders}
                  className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-[11px] transition-colors"
                >
                  Uyarı Gönder
                </button>
              </div>
            </div>
          </div>

          {/* Hızlı Erişim Linkleri */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Hızlı Erişim & Yönetim Alanları</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/residents-list')}
                className="p-4 border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-subtle)] text-center space-y-2 transition-all"
              >
                <Users className="mx-auto text-blue-500" size={20} />
                <span className="block text-[10px] font-bold text-[var(--text-primary)]">Sakin Yönetimi</span>
              </button>
              <button
                onClick={() => navigate('/financial')}
                className="p-4 border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-subtle)] text-center space-y-2 transition-all"
              >
                <Wallet className="mx-auto text-green-500" size={20} />
                <span className="block text-[10px] font-bold text-[var(--text-primary)]">Bütçe & Kasa</span>
              </button>
              <button
                onClick={() => navigate('/requests')}
                className="p-4 border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-subtle)] text-center space-y-2 transition-all"
              >
                <Wrench className="mx-auto text-amber-500" size={20} />
                <span className="block text-[10px] font-bold text-[var(--text-primary)]">Talepler</span>
              </button>
              <button
                onClick={() => navigate('/announcements')}
                className="p-4 border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-subtle)] text-center space-y-2 transition-all"
              >
                <Settings className="mx-auto text-red-400" size={20} />
                <span className="block text-[10px] font-bold text-[var(--text-primary)]">Duyuru Yayınla</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sağ 1 Sütun: Sistem Günlükleri / Audit Logs */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-light)] flex flex-col justify-between h-full min-h-[400px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Terminal size={16} className="text-[var(--text-muted)]" />
                Sistem Günlük Kayıtları
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[var(--bg-page)] border border-[var(--border-light)] text-[var(--text-muted)] rounded-full">Canlı</span>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-1">
              {logs.map((log) => (
                <div key={log.id} className="text-[10px] border-b border-[var(--border-light)] pb-2 space-y-0.5">
                  <span className="text-[var(--text-muted)] font-medium block">{log.time}</span>
                  <span className="text-[var(--text-secondary)] font-semibold leading-relaxed block">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border-light)] pt-3 mt-4 text-[9px] text-[var(--text-muted)] flex items-center gap-1">
            <Info size={12} />
            <span>Kullanıcı işlemlerini gerçek zamanlı takip eder.</span>
          </div>
        </div>
      </div>

      {/* REZERVASYON YAPMA MODALI */}
      {showDuesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDuesModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Toplu Aidat Tanımla</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Sitedeki tüm dairelerin borç kayıtlarına eklenecek aidat tutarını girin.</p>

            <form onSubmit={handleGenerateDues} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Aidat Tutarı (TL) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={duesAmount}
                  onChange={(e) => setDuesAmount(e.target.value)}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)] font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors mt-2"
              >
                İşlemi Başlat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
