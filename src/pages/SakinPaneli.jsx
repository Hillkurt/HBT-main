import React, { useContext, useState } from 'react';
import {
  ChevronRight, Wrench, Check, AlertTriangle, X, Trash2,
  CreditCard, Calendar, Home, Bell, Plus, Clock, TrendingUp, QrCode
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function SakinPaneli() {
  const {
    residents, requests, announcements, reservations, currentUser, packages, transactions,
    payResidentDues, addRequest, addReservation, cancelReservation,
    computeLateInterest, showNotification
  } = useContext(AppContext);

  const currentResidentData = residents.find(r => r.id === currentUser.id) || currentUser;
  const duesAmount = currentResidentData.dues || 0;
  const lateInterest = computeLateInterest(currentResidentData);
  const totalDue = duesAmount + lateInterest;

  // Son ödeme tarihine kalan gün
  const getDaysRemaining = () => {
    if (!currentResidentData.dueDate) return null;
    const today = new Date();
    const due = new Date(currentResidentData.dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const daysRemaining = getDaysRemaining();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [paymentData, setPaymentData] = useState({ name: currentUser.name, cardNumber: '', expiry: '', cvv: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [requestData, setRequestData] = useState({ title: '', category: 'Arıza', priority: 'Orta', description: '' });
  const [reserveData, setReserveData] = useState({
    facility: 'Spor Salonu',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 - 12:00'
  });
  const [reserveError, setReserveError] = useState('');

  const userRequests = requests.filter(r => r.residentName === currentUser.name || r.unit === currentUser.unit);
  const userReservations = reservations.filter(r => r.residentName === currentUser.name || r.unit === currentUser.unit);
  const userPackages = packages.filter(p => p.residentName === currentUser.name || p.unit === currentUser.unit);

  const buildingExpenses = (transactions || [])
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      alert('Lütfen 16 haneli geçerli bir kart numarası giriniz.');
      return;
    }
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        payResidentDues(currentUser.id, totalDue, 'Banka');
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setPaymentData({ name: currentUser.name, cardNumber: '', expiry: '', cvv: '' });
        showNotification(`${totalDue.toLocaleString('tr-TR')} TL ödemeniz başarıyla alındı!`, 'success');
      }, 1500);
    }, 2000);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestData.title || !requestData.description) { alert('Lütfen tüm alanları doldurunuz.'); return; }
    addRequest(requestData);
    setShowRequestModal(false);
    setRequestData({ title: '', category: 'Arıza', priority: 'Orta', description: '' });
  };

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    setReserveError('');
    const isConflict = reservations.some(
      r => r.facility === reserveData.facility && r.date === reserveData.date && r.timeSlot === reserveData.timeSlot
    );
    if (isConflict) { setReserveError('Bu tarih ve saatte zaten dolu. Lütfen başka bir slot seçin.'); return; }
    addReservation(reserveData);
    setShowReserveModal(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length > 0 ? parts.join(' ') : v;
  };

  const statusConfig = {
    'Beklemede': { dot: 'pending', label: 'Beklemede', badge: 'badge-warning' },
    'İşlemde':   { dot: 'active',  label: 'İşlemde',   badge: 'badge-info' },
    'Çözüldü':   { dot: 'active',  label: 'Çözüldü',   badge: 'badge-success' },
  };

  const priorityBadge = {
    'Yüksek': 'badge-danger',
    'Orta':   'badge-info',
    'Düşük':  'badge-gray',
  };

  return (
    <div className="space-y-6">

      {/* Başlık */}
      <div className="page-header animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Home size={18} className="text-white" />
          </div>
          <div>
            <h2>Hoş Geldiniz, {currentUser.name.split(' ')[0]}!</h2>
            <p>{currentUser.unit} • Sakin Paneli</p>
          </div>
        </div>
      </div>

      {/* Üst Grid: 3'lü */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">

        {/* Kart 1: Mali Durum */}
        <div className="card-primary p-6 flex flex-col justify-between animate-fade-in-up" style={{ minHeight: '220px' }}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-white/70 mb-1">Bekleyen Aidat Borcu</p>
                <p className={`text-4xl font-extrabold tracking-tight ${duesAmount > 0 ? 'text-white' : 'text-green-300'}`}>
                  {duesAmount > 0 ? `${duesAmount.toLocaleString('tr-TR')} TL` : '0 TL'}
                </p>
              </div>
              <span className={`badge text-[10px] ${duesAmount > 0 ? 'bg-red-400/30 text-red-100' : 'bg-green-400/30 text-green-100'}`}>
                {duesAmount > 0 ? 'Borçlu' : 'Borçsuz'}
              </span>
            </div>

            {/* Gecikme Faizi ve Son Ödeme Tarihi Bilgisi */}
            {duesAmount > 0 && (
              <div className="mt-3 space-y-1.5">
                {lateInterest > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-200">
                    <TrendingUp size={11} />
                    <span>Gecikme Faizi: +{lateInterest.toLocaleString('tr-TR')} TL</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold">
                  <span>Toplam Ödenecek: {totalDue.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Calendar size={11} />
                  {daysRemaining !== null ? (
                    daysRemaining < 0
                      ? <span className="text-red-300">Son ödeme tarihi {Math.abs(daysRemaining)} gün aştı!</span>
                      : daysRemaining === 0
                        ? <span className="text-amber-300">Son ödeme tarihi bugün!</span>
                        : <span>Son ödeme tarihine {daysRemaining} gün kaldı</span>
                  ) : (
                    <span>Son Ödeme: 15/{new Date().getMonth() + 1}/{new Date().getFullYear()}</span>
                  )}
                </div>
              </div>
            )}
            {duesAmount === 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <Calendar size={12} />
                <span>Son Ödeme: 15/{String(new Date().getMonth() + 1).padStart(2,'0')}/{new Date().getFullYear()}</span>
              </div>
            )}
          </div>
          <button
            disabled={duesAmount === 0}
            onClick={() => setShowPaymentModal(true)}
            className={`w-full py-3 rounded-xl font-bold text-sm mt-4 transition-all ${
              duesAmount > 0
                ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {duesAmount > 0 ? `💳 Öde (${totalDue.toLocaleString('tr-TR')} TL)` : '✓ Ödenecek Borç Yok'}
          </button>
        </div>

        {/* Kart 2: Aktif Talepler */}
        <div className="card p-5 flex flex-col animate-fade-in-up" style={{ minHeight: '220px' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Wrench size={15} style={{ color: 'var(--warning)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Aktif Taleplerim</h3>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Plus size={12} /> Yeni
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {userRequests.length === 0 ? (
              <div className="empty-state">
                <Check size={28} />
                <p>Aktif talebiniz bulunmuyor.</p>
              </div>
            ) : (
              userRequests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-2.5 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-page)' }}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`status-dot ${statusConfig[req.status]?.dot || 'inactive'}`} />
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{req.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{req.status}</p>
                    </div>
                  </div>
                  <span className={`badge ${priorityBadge[req.priority] || 'badge-gray'} flex-shrink-0`}>
                    {req.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kart 3: Duyurular */}
        <div className="card p-5 flex flex-col animate-fade-in-up" style={{ minHeight: '220px' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Duyuru Panosu</h3>
            </div>
            <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {announcements.slice(0, 4).map(ann => (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-3 rounded-xl cursor-pointer transition-all border hover:shadow-sm"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`badge ${ann.priority === 'Yüksek' ? 'badge-danger' : 'badge-gray'}`}>
                    {ann.category}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{ann.date}</span>
                </div>
                <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ann.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Satır Grid: 3 kolonlu (Kargo, Rezervasyon, vb.) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
        {/* Kargo ve Teslimat Takibi */}
        <div className="card p-5 flex flex-col animate-fade-in-up md:col-span-1" style={{ minHeight: '220px' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Kargolarım</h3>
            </div>
          </div>
          <div className="space-y-2.5 overflow-y-auto flex-1">
            {userPackages.length === 0 ? (
              <div className="empty-state h-full flex flex-col items-center justify-center">
                <Check size={28} className="mb-2 opacity-50" />
                <p>Bekleyen kargonuz bulunmuyor.</p>
              </div>
            ) : (
              userPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className="p-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-page)] relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                  <div className="flex justify-between items-start mb-1.5 pl-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{pkg.carrier}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${pkg.status === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {pkg.status}
                    </span>
                  </div>
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{pkg.description}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                      <Clock size={10} /> Teslim Saati: {pkg.arrivalTime}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kart 5: Rezervasyonlar */}
        <div className="card p-5 md:col-span-2 flex flex-col animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Ortak Alan Rezervasyonlarım</h3>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Spor salonu, otopark, toplantı odası</p>
            </div>
            <button
              onClick={() => setShowReserveModal(true)}
              className="btn"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Plus size={13} /> Rezervasyon Yap
            </button>
          </div>
          <div className="space-y-2.5 overflow-y-auto flex-1">
            {userReservations.length === 0 ? (
              <div className="empty-state h-full flex flex-col items-center justify-center">
                <Calendar size={28} className="mb-2 opacity-50" />
                <p>Aktif rezervasyonunuz bulunmuyor.</p>
              </div>
            ) : (
              userReservations.map(res => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 rounded-xl group transition-all"
                  style={{ background: 'var(--bg-page)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{res.facility}</p>
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} /> {res.date} | {res.timeSlot}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelReservation(res.id)}
                    className="p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                    title="İptal Et"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alt Grid: 4 kolon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 stagger">

        {/* Kart 4: Sakin Bilgileri */}
        <div className="card p-6 flex flex-col items-center justify-center text-center animate-fade-in-up">
          <span className="badge badge-success mb-4 uppercase text-[9px] tracking-widest">
            {currentResidentData.type || 'Kiracı'}
          </span>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)', color: 'var(--primary)' }}
          >
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</h4>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{currentUser.unit}</p>
          <div className="w-full divider" />
          <div className="text-[11px] space-y-1 w-full" style={{ color: 'var(--text-secondary)' }}>
            <p className="truncate">{currentUser.email}</p>
            <p>{currentUser.phone}</p>
          </div>
        </div>

        {/* YENİ KART: Dijital Anahtar (QR Geçiş Sistemi) */}
        <div className="card p-5 flex flex-col items-center justify-center text-center animate-fade-in-up relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-black pointer-events-none"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Dijital Anahtar Geçişi
          </h3>
          <div className={`p-1.5 rounded-2xl transition-all duration-500 shadow-xl ${currentResidentData.duesAmount > 0 ? 'bg-gradient-to-br from-red-500 to-orange-400' : 'bg-gradient-to-br from-green-400 to-emerald-600'}`}>
            <div className="bg-white p-3 rounded-xl flex items-center justify-center relative overflow-hidden">
              <QrCode size={64} className={currentResidentData.duesAmount > 0 ? 'text-red-600' : 'text-emerald-700'} strokeWidth={1.5} />
              {/* Scanline Animation Effect - CSS'de animate-scanline tanımlanacak veya JS style ile eklenecek */}
              <div 
                className="absolute left-0 w-full h-0.5 bg-current blur-[1px] shadow-[0_0_8px_currentColor] opacity-70" 
                style={{ 
                  color: currentResidentData.duesAmount > 0 ? '#ef4444' : '#10b981',
                  animation: 'scanline 2s linear infinite'
                }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 justify-center ${currentResidentData.duesAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              {currentResidentData.duesAmount > 0 ? <AlertTriangle size={12}/> : <Check size={12}/>}
              {currentResidentData.duesAmount > 0 ? 'Geçişler Kısıtlı' : 'Geçiş İzni Aktif'}
            </span>
          </div>
          <p className="text-[9px] mt-2 leading-relaxed px-2" style={{ color: 'var(--text-muted)' }}>
            {currentResidentData.duesAmount > 0 
              ? 'Mevcut borcunuzdan dolayı sosyal tesislere girişiniz sınırlandırılmıştır.' 
              : 'Turnike ve tesis kapılarına okutarak giriş yapabilirsiniz.'}
          </p>
        </div>

        {/* Kart 5: Site Giderleri */}
        <div className="card p-5 md:col-span-2 flex flex-col animate-fade-in-up" style={{ minHeight: '220px' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-red-500" />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Son Site Giderleri</h3>
            </div>
            <span className="text-[10px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold">Tüm Giderler</span>
          </div>
          <div className="flex-1 overflow-x-auto pr-1">
            {buildingExpenses.length === 0 ? (
              <div className="empty-state h-full">
                <p>Kayıtlı gider bulunmuyor.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-light)] text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                    <th className="py-2 pl-2">Tarih</th>
                    <th className="py-2">Kategori</th>
                    <th className="py-2">Açıklama</th>
                    <th className="py-2 text-right pr-2">Tutar</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[var(--text-primary)]">
                  {buildingExpenses.map(expense => (
                    <tr key={expense.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-2.5 pl-2 whitespace-nowrap text-[var(--text-secondary)]">{expense.date}</td>
                      <td className="py-2.5 font-semibold">{expense.category}</td>
                      <td className="py-2.5 text-[11px] text-[var(--text-secondary)] truncate max-w-[150px]">{expense.description}</td>
                      <td className="py-2.5 text-right pr-2 font-bold text-red-500 whitespace-nowrap">
                        -{Number(expense.amount).toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Aidat Ödeme */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-500 border border-white/10">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-page)] hover:bg-gray-200 text-[var(--text-primary)] transition-all">
              <X size={18} />
            </button>

            {paymentSuccess ? (
              <div className="flex flex-col items-center py-12 space-y-5 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping" />
                  <Check size={48} className="text-green-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Ödeme Başarılı!</h3>
                <p className="text-sm text-center text-[var(--text-muted)] max-w-[250px]">
                  {totalDue.toLocaleString('tr-TR')} TL tutarındaki ödemeniz başarıyla alındı ve aidat borcunuz kapatıldı.
                </p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">Güvenli Ödeme</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Toplam Ödenecek Tutar: <span className="text-blue-500 font-bold text-sm">{totalDue.toLocaleString('tr-TR')} TL</span></p>
                  {lateInterest > 0 && (
                    <p className="text-[10px] text-amber-500 font-semibold mt-1">İçerisinde {lateInterest.toLocaleString('tr-TR')} TL gecikme faizi bulunmaktadır.</p>
                  )}
                </div>

                {/* Glassmorphism Kredi Kartı Görseli */}
                <div className="w-full h-48 rounded-2xl p-5 mb-8 relative overflow-hidden shadow-xl transform transition-transform hover:scale-105 duration-300"
                     style={{
                       background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                     }}>
                  {/* Dekoratif Çemberler */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -ml-8 -mb-8" />
                  
                  <div className="relative z-10 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-center">
                      <CreditCard size={28} className="text-white/80 drop-shadow-md" />
                      <div className="flex gap-1.5">
                        <div className="w-8 h-5 rounded-md bg-white/20 backdrop-blur-sm border border-white/10" />
                        <div className="w-5 h-5 rounded-full bg-red-500/80 mix-blend-multiply" />
                        <div className="w-5 h-5 rounded-full bg-yellow-500/80 mix-blend-multiply -ml-3" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest mb-1">Kart Numarası</p>
                      <p className="text-xl sm:text-2xl font-mono font-medium tracking-widest text-white/90 drop-shadow-sm">
                        {paymentData.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-[9px] text-white/60 font-semibold uppercase tracking-widest">Kart Sahibi</p>
                        <p className="text-sm font-bold uppercase tracking-wider text-white/90 truncate max-w-[150px] drop-shadow-sm">
                          {paymentData.name || 'AD SOYAD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/60 font-semibold uppercase tracking-widest">SKT</p>
                        <p className="text-sm font-bold tracking-wider text-white/90 drop-shadow-sm">
                          {paymentData.expiry || 'AA/YY'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Kart Sahibinin Adı</label>
                    <input type="text" required value={paymentData.name}
                      onChange={e => setPaymentData({ ...paymentData, name: e.target.value })}
                      placeholder="Kart üzerindeki isim" 
                      className="w-full bg-[var(--bg-page)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Kart Numarası</label>
                    <input type="text" required maxLength="19" value={paymentData.cardNumber}
                      onChange={e => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="0000 0000 0000 0000" 
                      className="w-full bg-[var(--bg-page)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Son Kullanma</label>
                      <input type="text" required maxLength="5" placeholder="AA/YY" value={paymentData.expiry}
                        onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">CVC / CVV</label>
                      <input type="password" required maxLength="3" placeholder="•••" value={paymentData.cvv}
                        onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value })}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                    </div>
                  </div>
                  <button type="submit" disabled={paymentLoading} 
                          className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-3.5 mt-4 font-bold text-sm shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                    {paymentLoading ? (
                      <div className="flex items-center justify-center gap-2">
                         <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                         <span>İşleniyor...</span>
                      </div>
                    ) : (
                      <span>{totalDue.toLocaleString('tr-TR')} TL Ödemeyi Tamamla</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Yeni Talep */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md p-6">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Yeni Hizmet / Arıza Talebi</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Yönetime iletmek istediğiniz konuları bildirin.</p>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Talep Başlığı</label>
                <input type="text" required placeholder="Sorunu kısaca tanımlayın"
                  value={requestData.title} onChange={e => setRequestData({ ...requestData, title: e.target.value })}
                  className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kategori</label>
                  <select value={requestData.category} onChange={e => setRequestData({ ...requestData, category: e.target.value })} className="input">
                    <option value="Arıza">Arıza / Onarım</option>
                    <option value="Temizlik">Temizlik</option>
                    <option value="Güvenlik">Güvenlik</option>
                    <option value="Peyzaj">Peyzaj / Çevre</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Öncelik</label>
                  <select value={requestData.priority} onChange={e => setRequestData({ ...requestData, priority: e.target.value })} className="input">
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Açıklama / Detaylar</label>
                <textarea required rows="3" placeholder="Detaylı açıklama yazın..."
                  value={requestData.description} onChange={e => setRequestData({ ...requestData, description: e.target.value })}
                  className="input resize-none" />
              </div>
              <button type="submit" className="btn btn-accent w-full justify-center py-3 text-sm">
                Talebi Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Rezervasyon */}
      {showReserveModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm p-6">
            <button onClick={() => setShowReserveModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ortak Alan Rezervasyonu</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Sosyal tesisler veya otopark için yerinizi ayırtın.</p>
            <form onSubmit={handleReserveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Rezervasyon Alanı</label>
                <select value={reserveData.facility} onChange={e => setReserveData({ ...reserveData, facility: e.target.value })} className="input">
                  <option value="Spor Salonu">Spor Salonu (Gym)</option>
                  <option value="Misafir Otoparkı">Misafir Otoparkı</option>
                  <option value="Toplantı Odası">Toplantı Odası</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tarih</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={reserveData.date} onChange={e => setReserveData({ ...reserveData, date: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Saat Aralığı</label>
                <select value={reserveData.timeSlot} onChange={e => setReserveData({ ...reserveData, timeSlot: e.target.value })} className="input">
                  {['08:00 - 10:00','10:00 - 12:00','12:00 - 14:00','14:00 - 16:00','16:00 - 18:00','18:00 - 20:00','20:00 - 22:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {reserveError && (
                <div className="flex gap-2 p-3 rounded-xl text-xs font-medium" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {reserveError}
                </div>
              )}
              <button type="submit" className="btn btn-accent w-full justify-center py-3 text-sm">
                Rezervasyonu Tamamla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Duyuru Detayı */}
      {selectedAnnouncement && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md p-6">
            <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${selectedAnnouncement.priority === 'Yüksek' ? 'badge-danger' : 'badge-info'}`}>
                {selectedAnnouncement.category}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedAnnouncement.date}</span>
            </div>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{selectedAnnouncement.title}</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {selectedAnnouncement.content}
            </p>
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="btn btn-outline w-full justify-center mt-6"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
