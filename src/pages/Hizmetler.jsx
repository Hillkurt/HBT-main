import React, { useContext, useState } from 'react';
import { 
  Calendar, Clock, User, Dumbbell, Car, Users, Info, 
  Trash2, X, Plus, AlertCircle, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Hizmetler() {
  const { 
    reservations, addReservation, cancelReservation, currentUser, currentRole 
  } = useContext(AppContext);

  // Modallar
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('Spor Salonu');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Takvim İçin Seçili Tarih
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Rezervasyon Form State'i
  const [formData, setFormData] = useState({
    date: selectedDate,
    timeSlot: '10:00 - 12:00',
    spotNumber: 'Spot 1'
  });

  const timeSlots = [
    "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", 
    "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"
  ];

  const facilities = [
    {
      id: 'gym',
      name: 'Spor Salonu',
      icon: Dumbbell,
      capacity: 'Maks. 10 Kişi',
      hours: '08:00 - 22:00',
      status: 'Açık',
      description: 'Koşu bantları, ağırlık üniteleri ve kardiyo.'
    },
    {
      id: 'parking',
      name: 'Misafir Otoparkı',
      icon: Car,
      capacity: '10 Araçlık Kapasite',
      hours: '24 Saat',
      status: 'Açık',
      description: 'Misafir araçları için ayrılmış park alanları.'
    },
    {
      id: 'meeting',
      name: 'Toplantı Odası',
      icon: Users,
      capacity: 'Maks. 15 Kişi',
      hours: '09:00 - 21:00',
      status: 'Açık',
      description: 'Projeksiyon ve toplantı masası.'
    }
  ];

  // Tarih Değiştirme Yardımcıları
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDateStr = d.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setFormData(prev => ({...prev, date: newDateStr}));
  };

  const handleOpenBookModal = (facName, prefilledTime = '10:00 - 12:00') => {
    setSelectedFacility(facName);
    setFormData(prev => ({...prev, timeSlot: prefilledTime}));
    setBookingError('');
    setBookingSuccess(false);
    setShowBookModal(true);
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    const isConflict = reservations.some(res => {
      if (selectedFacility === 'Misafir Otoparkı') {
        return res.facility === selectedFacility &&
               res.date === formData.date &&
               res.timeSlot === formData.timeSlot &&
               res.spotNumber === formData.spotNumber;
      }
      return res.facility === selectedFacility &&
             res.date === formData.date &&
             res.timeSlot === formData.timeSlot;
    });

    if (isConflict) {
      if (selectedFacility === 'Misafir Otoparkı') {
        setBookingError(`${formData.spotNumber} seçtiğiniz tarih ve saatte dolu.`);
      } else {
        setBookingError(`Seçtiğiniz tarih ve saat diliminde bu alan rezerve edilmiştir.`);
      }
      return;
    }

    addReservation({
      facility: selectedFacility,
      date: formData.date,
      timeSlot: formData.timeSlot,
      spotNumber: selectedFacility === 'Misafir Otoparkı' ? formData.spotNumber : null
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookModal(false);
      setBookingSuccess(false);
    }, 1500);
  };

  const handleCancelClick = (id) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      cancelReservation(id);
    }
  };

  // İlgili günün rezervasyonlarını getir
  const dayReservations = reservations.filter(r => r.date === selectedDate);

  // Hücre durumu hesaplama
  const getSlotStatus = (facilityName, slot) => {
    // Otopark spot bazlı çalıştığı için takvimde doluluk hesabı farklı (tamamen dolu mu?)
    if (facilityName === 'Misafir Otoparkı') {
      const parkRes = dayReservations.filter(r => r.facility === facilityName && r.timeSlot === slot);
      if (parkRes.length >= 10) return { status: 'full' };
      const myRes = parkRes.find(r => r.residentName === currentUser.name || r.unit === currentUser.unit);
      if (myRes) return { status: 'mine', res: myRes };
      return { status: 'available' };
    }

    const res = dayReservations.find(r => r.facility === facilityName && r.timeSlot === slot);
    if (!res) return { status: 'available' };
    
    if (res.residentName === currentUser.name || res.unit === currentUser.unit) {
      return { status: 'mine', res };
    }
    
    if (currentRole === 'yonetici') {
      return { status: 'admin_view', res };
    }
    
    return { status: 'booked', res };
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ortak Alan Hizmetleri</h2>
          <p className="text-xs text-[var(--text-muted)]">Tesisleri inceleyin ve size en uygun saatleri interaktif takvimden ayırın.</p>
        </div>
      </div>

      {/* Tesisler Listesi (Özet Kartlar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilities.map(fac => {
          const IconComponent = fac.icon;
          return (
            <div key={fac.id} className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-sm border border-[var(--border-light)] flex flex-col justify-between hover:border-blue-300 transition-colors cursor-pointer" onClick={() => handleOpenBookModal(fac.name)}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <IconComponent size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{fac.name}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">{fac.capacity} • {fac.hours}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* İNTERAKTİF TAKVİM ARAYÜZÜ */}
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
        {/* Takvim Üst Barı - Tarih Seçici */}
        <div className="p-4 border-b border-[var(--border-light)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-subtle)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Etkileşimli Rezervasyon Takvimi</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Seçilen tarihteki doluluk durumunu görün ve kutulara tıklayarak rezervasyon yapın.</p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--bg-card)] px-2 py-1.5 rounded-xl border border-[var(--border-light)] shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ChevronLeft size={18}/>
            </button>
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] min-w-[120px] justify-center">
              <Calendar size={16} className="text-blue-600"/>
              {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* Takvim Grid'i */}
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Grid Başlıkları (Zaman Dilimleri) */}
            <div className="flex mb-4">
              <div className="w-40 shrink-0"></div>
              <div className="flex-1 grid grid-cols-7 gap-2">
                {timeSlots.map((slot, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {slot.split('-')[0]}<br/><span className="text-[9px] opacity-70">başlangıç</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tesis Satırları */}
            <div className="space-y-4">
              {facilities.map(fac => (
                <div key={fac.id} className="flex items-center">
                  {/* Tesis Adı Sol Sütun */}
                  <div className="w-40 shrink-0 pr-4">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{fac.name}</div>
                    <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{fac.capacity}</div>
                  </div>

                  {/* Saat Slotları */}
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {timeSlots.map((slot, i) => {
                      const { status, res } = getSlotStatus(fac.name, slot);
                      
                      let slotClasses = "h-14 rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all cursor-pointer relative overflow-hidden group";
                      let slotContent = null;

                      if (status === 'available') {
                        slotClasses += " border-[var(--border-light)] bg-[var(--bg-page)] hover:border-blue-400 hover:bg-blue-50 text-[var(--text-muted)] hover:text-blue-600";
                        slotContent = <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Boş<br/>Seç</span>;
                      } else if (status === 'mine') {
                        slotClasses += " border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm";
                        slotContent = (
                          <>
                            <span className="text-[10px] font-bold z-10">Benim</span>
                            <span className="text-[9px] z-10 opacity-80 truncate px-1 max-w-full">{fac.name === 'Misafir Otoparkı' ? res.spotNumber : 'Rezervasyonum'}</span>
                            <div className="absolute inset-0 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold z-20">
                              İptal Et
                            </div>
                          </>
                        );
                      } else if (status === 'booked') {
                        slotClasses += " border-red-100 bg-red-50 text-red-400 cursor-not-allowed";
                        slotContent = <span className="text-[10px] font-semibold">Dolu</span>;
                      } else if (status === 'admin_view') {
                         slotClasses += " border-amber-200 bg-amber-50 text-amber-700 shadow-sm";
                         slotContent = (
                          <>
                            <span className="text-[9px] font-bold z-10 truncate px-1 max-w-full">{res.residentName}</span>
                            <span className="text-[8px] z-10 opacity-80">{res.unit}</span>
                            <div className="absolute inset-0 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold z-20">
                              İptal Et
                            </div>
                          </>
                        );
                      } else if (status === 'full') {
                        slotClasses += " border-red-100 bg-red-50 text-red-400 cursor-not-allowed";
                        slotContent = <span className="text-[10px] font-semibold">Kapasite<br/>Dolu</span>;
                      }

                      return (
                        <div 
                          key={i} 
                          className={slotClasses}
                          onClick={() => {
                            if (status === 'available') {
                              handleOpenBookModal(fac.name, slot);
                            } else if (status === 'mine' || status === 'admin_view') {
                              handleCancelClick(res.id);
                            }
                          }}
                          title={slot}
                        >
                          {status === 'available' && <div className="absolute inset-0 bg-[var(--bg-subtle)] group-hover:opacity-0 transition-opacity"></div>}
                          {slotContent}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Lejant (Açıklamalar) */}
            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-medium text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[var(--bg-page)] border border-[var(--border-light)]"></div> Boş Slot</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></div> Sizin Rezervasyonunuz</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div> Dolu (Başkasına Ait)</div>
            </div>

          </div>
        </div>
      </div>

      {/* REZERVASYON YAPMA MODALI */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowBookModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            {bookingSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold animate-bounce">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Rezervasyon Onaylandı!</h3>
                <p className="text-xs text-[var(--text-muted)] text-center">Takvim üzerinde yeriniz işaretlendi.</p>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{selectedFacility}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-5">Seçilen Tarih: {new Date(formData.date).toLocaleDateString('tr-TR')}</p>

                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Tarih</label>
                    <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Saat Dilimi</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {selectedFacility === 'Misafir Otoparkı' && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Park Yeri</label>
                      <select
                        value={formData.spotNumber}
                        onChange={(e) => setFormData({ ...formData, spotNumber: e.target.value })}
                        className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={`Spot ${i + 1}`}>Spot {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {bookingError && (
                    <div className="flex gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors mt-2"
                  >
                    Rezervasyonu Onayla
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
