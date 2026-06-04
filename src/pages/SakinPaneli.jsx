import React, { useContext, useState } from 'react';
import {
  ChevronRight, Wrench, Check, AlertTriangle, X, Trash2,
  CreditCard, Calendar, Home, Bell, Plus, Clock, TrendingUp
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function SakinPaneli() {
  const {
    residents, requests, announcements, reservations, currentUser,
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

      {/* Alt Grid: 4 kolon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger">

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
          <div className="space-y-2.5 overflow-y-auto flex-1" style={{ maxHeight: '180px' }}>
            {userReservations.length === 0 ? (
              <div className="empty-state">
                <Calendar size={28} />
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
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      {res.facility[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{res.facility}</p>
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={9} /> {res.date} • {res.timeSlot}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelReservation(res.id)}
                    className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                    title="İptal Et"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kart 6: Takvim */}
        <div className="card p-5 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Hizmet Takvimi
            </h3>
            <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>Haziran 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            {['Pz', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {[28,29,30,31].map(d => <div key={d} className="opacity-30">{d}</div>)}
            {[1,2,3].map(d => <div key={d}>{d}</div>)}
            {[4,5,6].map(d => <div key={d}>{d}</div>)}
            <div
              className="w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold text-white"
              style={{ background: 'var(--primary)' }}
            >7</div>
            {[8,9,10,11,12,13,14,15,16,17].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="flex gap-2 items-center mt-4 pt-3 border-t text-[10px]" style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
            <span>7 Haziran – Rezerve Gün</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: Aidat Ödeme */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm p-6">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>

            {paymentSuccess ? (
              <div className="flex flex-col items-center py-8 space-y-4 animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={36} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Ödeme Başarılı!</h3>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Ödemeniz alındı ve aidat borcunuz kapatıldı.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Aidat Borcu Öde</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ana Borcu: {duesAmount.toLocaleString('tr-TR')} TL</p>
                    {lateInterest > 0 && (
                      <p className="text-xs text-amber-600 font-semibold">
                        + Gecikme Faizi: {lateInterest.toLocaleString('tr-TR')} TL → Toplam: {totalDue.toLocaleString('tr-TR')} TL
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kart Sahibinin Adı</label>
                    <input type="text" required value={paymentData.name}
                      onChange={e => setPaymentData({ ...paymentData, name: e.target.value })}
                      placeholder="Ad Soyad" className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kart Numarası</label>
                    <input type="text" required maxLength="19" value={paymentData.cardNumber}
                      onChange={e => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="0000 0000 0000 0000" className="input font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Son Kullanma</label>
                      <input type="text" required maxLength="5" placeholder="AA/YY" value={paymentData.expiry}
                        onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })}
                        className="input text-center" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>CVC / CVV</label>
                      <input type="password" required maxLength="3" placeholder="•••" value={paymentData.cvv}
                        onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value })}
                        className="input text-center" />
                    </div>
                  </div>
                  <button type="submit" disabled={paymentLoading} className="btn btn-accent w-full justify-center py-3 text-sm mt-2">
                    {paymentLoading
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : `Ödemeyi Tamamla (${totalDue.toLocaleString('tr-TR')} TL)`
                    }
                  </button>
                </form>
              </>
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
