import React, { useContext, useState } from 'react';
import { 
  Calendar, Clock, User, Dumbbell, Car, Users, Info, 
  Trash2, X, Plus, AlertCircle, CheckCircle 
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

  // Rezervasyon Form State'i
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 - 12:00',
    spotNumber: 'Spot 1' // otopark için
  });

  // Tesis Tanımları
  const facilities = [
    {
      id: 'gym',
      name: 'Spor Salonu',
      icon: Dumbbell,
      capacity: 'Maks. 10 Kişi (Aynı Anda)',
      hours: '08:00 - 22:00',
      status: 'Açık',
      description: 'Koşu bantları, ağırlık üniteleri ve kardiyo aletleri yer almaktadır. Giriş ücretsizdir.'
    },
    {
      id: 'parking',
      name: 'Misafir Otoparkı',
      icon: Car,
      capacity: '10 Araçlık Kapasite',
      hours: '24 Saat',
      status: 'Açık',
      description: 'Misafirlerinizin araçları için ayrılmış park alanlarıdır. Rezervasyon gereklidir.'
    },
    {
      id: 'meeting',
      name: 'Toplantı Odası',
      icon: Users,
      capacity: 'Maks. 15 Kişi',
      hours: '09:00 - 21:00',
      status: 'Açık',
      description: 'Projeksiyon cihazı, toplantı masası ve tahta bulunan ortak çalışma ve toplantı alanı.'
    }
  ];

  // Rezervasyon Yapma Buton Klik
  const handleOpenBookModal = (facName) => {
    setSelectedFacility(facName);
    setBookingError('');
    setBookingSuccess(false);
    setShowBookModal(true);
  };

  // Rezervasyon Gönderme
  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    // Çakışma Kontrolü
    const isConflict = reservations.some(res => {
      // Otopark için hem tarih, saat hem de spot numarası çakışmalı
      if (selectedFacility === 'Misafir Otoparkı') {
        return res.facility === selectedFacility &&
               res.date === formData.date &&
               res.timeSlot === formData.timeSlot &&
               res.spotNumber === formData.spotNumber;
      }
      // Spor salonu ve toplantı odası için genel tarih/saat çakışması
      return res.facility === selectedFacility &&
             res.date === formData.date &&
             res.timeSlot === formData.timeSlot;
    });

    if (isConflict) {
      if (selectedFacility === 'Misafir Otoparkı') {
        setBookingError(`${formData.spotNumber} seçtiğiniz tarih ve saatte dolu. Lütfen başka bir spot veya saat seçin.`);
      } else {
        setBookingError(`Seçtiğiniz tarih ve saat diliminde bu alan rezerve edilmiştir. Lütfen farklı bir saat seçin.`);
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

  // İptal Buton Klik
  const handleCancelClick = (id) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      cancelReservation(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ortak Alan Hizmet Takibi</h2>
          <p className="text-xs text-[var(--text-muted)]">Ortak sosyal tesisler, spor salonu ve misafir otoparkı rezervasyonlarınızı yönetin</p>
        </div>
      </div>

      {/* Tesisler Listesi (Kart Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilities.map(fac => {
          const IconComponent = fac.icon;
          return (
            <div key={fac.id} className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--border-light)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <IconComponent size={24} />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                    {fac.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{fac.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{fac.description}</p>
                </div>
                <div className="border-t border-[var(--border-light)] pt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex justify-between"><span>Kapasite:</span><span className="font-semibold text-[var(--text-primary)]">{fac.capacity}</span></div>
                  <div className="flex justify-between"><span>Hizmet Saatleri:</span><span className="font-semibold text-[var(--text-primary)]">{fac.hours}</span></div>
                </div>
              </div>
              <button
                onClick={() => handleOpenBookModal(fac.name)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors mt-6"
              >
                Rezervasyon Yap
              </button>
            </div>
          );
        })}
      </div>

      {/* Rezervasyon Listesi Kartı */}
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)]">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Güncel Rezervasyon Listesi</h3>
          <p className="text-xs text-[var(--text-muted)]">Sitedeki tüm ortak alan kullanım listesi</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold border-b border-[var(--border-light)]">
                <th className="px-6 py-4">Tesis</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Saat Aralığı</th>
                <th className="px-6 py-4">Daire / Sakin</th>
                <th className="px-6 py-4">Detay</th>
                <th className="px-6 py-4 text-right">İptal</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[var(--text-primary)] divide-y divide-[var(--border-light)]">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[var(--text-muted)] italic">
                    Kayıtlı rezervasyon bulunmuyor.
                  </td>
                </tr>
              ) : (
                reservations.map(res => {
                  const isOwnBooking = res.residentName === currentUser.name || res.unit === currentUser.unit;
                  const canCancel = isOwnBooking || currentRole === 'yonetici';
                  
                  return (
                    <tr key={res.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{res.facility}</td>
                      <td className="px-6 py-4">{res.date}</td>
                      <td className="px-6 py-4">{res.timeSlot}</td>
                      <td className="px-6 py-4 font-medium">
                        {res.residentName} ({res.unit})
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)] italic">
                        {res.spotNumber ? `Park Yeri: ${res.spotNumber}` : 'Ortak Kullanım'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canCancel ? (
                          <button
                            onClick={() => handleCancelClick(res.id)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            title="Rezervasyonu İptal Et"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold px-2 py-0.5 bg-[var(--bg-subtle)] rounded">Yetki Yok</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
                <h3 className="text-base font-bold text-[var(--text-primary)]">Rezervasyon Yapıldı!</h3>
                <p className="text-xs text-[var(--text-muted)] text-center">Tesis yeriniz ayrıldı. Rezervasyon listenizde görebilirsiniz.</p>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{selectedFacility} Rezervasyonu</h3>
                <p className="text-xs text-[var(--text-muted)] mb-5">Lütfen rezervasyon tarihini ve saat aralığını belirleyin.</p>

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
                      <option value="08:00 - 10:00">08:00 - 10:00</option>
                      <option value="10:00 - 12:00">10:00 - 12:00</option>
                      <option value="12:00 - 14:00">12:00 - 14:00</option>
                      <option value="14:00 - 16:00">14:00 - 16:00</option>
                      <option value="16:00 - 18:00">16:00 - 18:00</option>
                      <option value="18:00 - 20:00">18:00 - 20:00</option>
                      <option value="20:00 - 22:00">20:00 - 22:00</option>
                    </select>
                  </div>

                  {selectedFacility === 'Misafir Otoparkı' && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Park Yeri (Spot Seçimi)</label>
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
