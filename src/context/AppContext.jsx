import React, { createContext, useState, useEffect, useCallback } from 'react';
// Backend API fonksiyonlarını içe aktar
// Backend çalışmıyorsa bu fonksiyonlar hata fırlatır ve mock veriye düşeriz
import {
  checkBackendHealth,
  authLogin   as apiLogin,
  authLogout  as apiLogout,
  getResidents, createResident, updateResident as apiUpdateResident, deleteResident as apiDeleteResident,
  payDues, generateMonthlyDues as apiGenerateDues,
  getTransactions, createTransaction, deleteTransaction,
  getRequests, createRequest, updateRequestStatus as apiUpdateStatus, deleteRequest,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getReservations, createReservation, cancelReservation as apiCancelReservation,
  getLogs,
} from '../services/api';

export const AppContext = createContext();

// ─── Kullanıcı Tablosu (Kimlik Doğrulama) ──────────────────────────────
const USERS = [
  {
    id: 1,
    username: 'hilal.kurt',
    password: '1234',
    role: 'sakin',
    name: 'Hilal Kurt',
    unit: 'Blok A / Daire 1',
    type: 'Mal Sahibi',
    email: 'hilal.kurt@example.com',
    phone: '0532 111 22 33',
  },
  {
    id: 0,
    username: 'yonetici',
    password: 'admin123',
    role: 'yonetici',
    name: 'Yönetici',
    unit: 'Yönetim Ofisi',
    type: 'Yönetici',
    email: 'yonetici@dijitalyonetim.com',
    phone: '0312 000 00 00',
  },
];

// Başlangıç Sakin Verileri (Türkçe)
// Gecikme faizi oranı: aylık %5
const LATE_INTEREST_RATE = 0.05;

// Son ödeme tarihi hesaplama: her ayın 15'i
const getDefaultDueDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
};

const initialResidents = [
  { id: 1, unit: 'Blok A / Daire 1', name: 'Hilal Kurt', type: 'Mal Sahibi', email: 'hilal.kurt@example.com', phone: '0532 111 22 33', status: 'warning', dues: 1200, dueDate: '2026-05-15' },
  { id: 2, unit: 'Blok A / Daire 2', name: 'Ayşe Demir', type: 'Kiracı', email: 'ayse.demir@example.com', phone: '0543 222 33 44', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 3, unit: 'Blok B / Daire 1', name: 'Mehmet Öz', type: 'Kiracı', email: 'mehmet.oz@example.com', phone: '0554 333 44 55', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 4, unit: 'Blok B / Daire 2', name: 'Zeynep Kaya', type: 'Mal Sahibi', email: 'zeynep.kaya@example.com', phone: '0505 444 55 66', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 5, unit: 'Blok A / Daire 3', name: 'Can Korkmaz', type: 'Mal Sahibi', email: 'can.korkmaz@example.com', phone: '0535 555 66 77', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 6, unit: 'Blok A / Daire 4', name: 'Fatma Şahin', type: 'Kiracı', email: 'fatma.sahin@example.com', phone: '0542 666 77 88', status: 'warning', dues: 2400, dueDate: '2026-04-15' },
  { id: 7, unit: 'Blok B / Daire 3', name: 'Ramazan Öz', type: 'Kiracı', email: 'ramazan.oz@example.com', phone: '0533 777 88 99', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 8, unit: 'Blok B / Daire 4', name: 'Tuğçe Deniz Kaya', type: 'Kiracı', email: 'tugce.kaya@example.com', phone: '0555 123 45 67', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
  { id: 9, unit: 'Blok C / Daire 1', name: 'Beyza Savaş', type: 'Mal Sahibi', email: 'beyza.savas@example.com', phone: '0534 987 65 43', status: 'paid', dues: 0, dueDate: getDefaultDueDate() },
];

// Başlangıç Gelir/Gider İşlemleri (Grafikler için veri kaynağı)
const initialTransactions = [
  // Ocak
  { id: 1, date: '2026-01-05', type: 'income', category: 'Aidat', amount: 12000, method: 'Banka', description: 'Ocak Ayı Aidat Tahsilatları' },
  { id: 2, date: '2026-01-10', type: 'expense', category: 'Personel', amount: 4000, method: 'Banka', description: 'Kapıcı Maaşı ve SGK' },
  { id: 3, date: '2026-01-15', type: 'expense', category: 'Bakım', amount: 2500, method: 'Banka', description: 'Jeneratör Periyodik Bakım' },
  { id: 4, date: '2026-01-20', type: 'expense', category: 'Ortak Alan', amount: 1500, method: 'Nakit', description: 'Ortak Alan Elektrik Faturası' },
  
  // Şubat
  { id: 5, date: '2026-02-05', type: 'income', category: 'Aidat', amount: 15000, method: 'Banka', description: 'Şubat Ayı Aidat Tahsilatları' },
  { id: 6, date: '2026-02-12', type: 'expense', category: 'Personel', amount: 4500, method: 'Banka', description: 'Temizlik Personeli Maaş' },
  { id: 7, date: '2026-02-18', type: 'expense', category: 'Bakım', amount: 3500, method: 'Banka', description: 'Asansör Revizyon Bedeli' },
  { id: 8, date: '2026-02-22', type: 'expense', category: 'Yönetim', amount: 2000, method: 'Nakit', description: 'Kırtasiye ve Ofis Giderleri' },

  // Mart
  { id: 9, date: '2026-03-05', type: 'income', category: 'Aidat', amount: 11000, method: 'Banka', description: 'Mart Ayı Aidat Tahsilatları' },
  { id: 10, date: '2026-03-10', type: 'expense', category: 'Personel', amount: 4500, method: 'Banka', description: 'Personel Giderleri' },
  { id: 11, date: '2026-03-15', type: 'expense', category: 'Bakım', amount: 5500, method: 'Banka', description: 'Hidrofor Değişimi' },
  { id: 12, date: '2026-03-25', type: 'expense', category: 'Ortak Alan', amount: 2000, method: 'Banka', description: 'Ortak Alan Su Gideri' },

  // Nisan
  { id: 13, date: '2026-04-05', type: 'income', category: 'Aidat', amount: 18000, method: 'Banka', description: 'Nisan Ayı Aidat Tahsilatları' },
  { id: 14, date: '2026-04-12', type: 'expense', category: 'Personel', amount: 4500, method: 'Banka', description: 'Personel Giderleri' },
  { id: 15, date: '2026-04-18', type: 'expense', category: 'Bakım', amount: 3000, method: 'Banka', description: 'Çatı Yalıtım Onarımı' },
  { id: 16, date: '2026-04-20', type: 'expense', category: 'Yönetim', amount: 1500, method: 'Nakit', description: 'Toplantı Organizasyon Gideri' },

  // Mayıs
  { id: 17, date: '2026-05-05', type: 'income', category: 'Aidat', amount: 20000, method: 'Banka', description: 'Mayıs Ayı Aidat Tahsilatları' },
  { id: 18, date: '2026-05-10', type: 'expense', category: 'Personel', amount: 5000, method: 'Banka', description: 'Personel Giderleri' },
  { id: 19, date: '2026-05-15', type: 'expense', category: 'Bakım', amount: 4000, method: 'Banka', description: 'Bahçe Peyzaj Yenileme' },
  { id: 20, date: '2026-05-20', type: 'expense', category: 'Ortak Alan', amount: 2000, method: 'Nakit', description: 'Havuz Kimyasalları Alımı' },

  // Haziran (Son Aktif Ay)
  { id: 21, date: '2026-06-01', type: 'income', category: 'Aidat', amount: 16000, method: 'Banka', description: 'Haziran Ayı Kısmi Aidat Tahsilatları' },
  { id: 22, date: '2026-06-02', type: 'expense', category: 'Personel', amount: 5000, method: 'Banka', description: 'Güvenlik Firması Ödemesi' },
  { id: 23, date: '2026-06-03', type: 'expense', category: 'Bakım', amount: 6000, method: 'Banka', description: 'Kazan Dairesi Boru Değişimi' },
  { id: 24, date: '2026-06-03', type: 'expense', category: 'Yönetim', amount: 2000, method: 'Nakit', description: 'Yazılım ve Muhasebe Gideri' },
];

// Başlangıç Talepler
const initialRequests = [
  { id: 1, title: 'Kapı Otomatiği Arızası', description: 'A Blok ana giriş kapısının otomatiği çalışmıyor, kartla açılmıyor.', category: 'Arıza', priority: 'Yüksek', status: 'Tamamlandı', date: '2026-05-10', unit: 'Blok A / Daire 4', residentName: 'Fatma Şahin' },
  { id: 2, title: 'Genel Koridor Temizliği', description: 'B Blok 2. kat koridorlarının daha detaylı temizlenmesi gerekiyor.', category: 'Temizlik', priority: 'Düşük', status: 'İşlemde', date: '2026-05-28', unit: 'Blok B / Daire 1', residentName: 'Mehmet Öz' },
  { id: 3, title: 'Bahçe Aydınlatma Lambası', description: 'Oyun parkının yanındaki aydınlatma direğinin lambası yanmıyor.', category: 'Arıza', priority: 'Orta', status: 'Beklemede', date: '2026-06-02', unit: 'Blok A / Daire 1', residentName: 'Ahmet Yılmaz' },
  { id: 4, title: 'Asansör Sarsıntı Yapıyor', description: 'A Blok sağ asansör 3. ve 4. katlar arasında sarsıntı yapıyor.', category: 'Arıza', priority: 'Yüksek', status: 'Beklemede', date: '2026-06-03', unit: 'Blok A / Daire 2', residentName: 'Ayşe Demir' },
];

// Başlangıç Duyurular
const initialAnnouncements = [
  { id: 1, title: 'Planlı Su Kesintisi', content: 'Belediyenin şebeke yenileme çalışması nedeniyle 15/06/2026 tarihinde 09:00 - 17:00 saatleri arasında sitemizde su kesintisi yaşanacaktır. Önlem almanız önemle rica olunur.', category: 'Acil', priority: 'Yüksek', date: '2026-06-02' },
  { id: 2, title: 'Dış Cephe Boya Anketi', content: 'Bloklarımızın dış cephe boyasının yenilenmesi amacıyla renk seçimi anketi yönetim panosuna asılmıştır. Lütfen en geç Cuma gününe kadar oyunuzu kullanınız.', category: 'Genel', priority: 'Normal', date: '2026-06-01' },
  { id: 3, title: 'Ortak Alan Kullanım Kuralları', content: 'Yaz sezonunun başlamasıyla birlikte havuz ve spor salonu kullanım saatleri sabah 08:00 - akşam 22:00 olarak güncellenmiştir. Lütfen kurallara riayet edelim.', category: 'Genel', priority: 'Normal', date: '2026-05-25' },
  { id: 4, title: 'Aidat Ödemeleri Hakkında', content: 'Gecikmiş aidat borcu bulunan sakinlerimizin yasal işlem başlatılmadan önce borçlarını kapatmalarını önemle rica ederiz.', category: 'Finansal', priority: 'Yüksek', date: '2026-05-20' },
];

// Başlangıç Rezervasyonlar
const initialReservations = [
  { id: 1, facility: 'Spor Salonu', date: '2026-06-07', timeSlot: '10:00 - 12:00', unit: 'Blok A / Daire 1', residentName: 'Ahmet Yılmaz' },
  { id: 2, facility: 'Misafir Otoparkı', date: '2026-06-07', timeSlot: '14:00 - 18:00', unit: 'Blok B / Daire 2', residentName: 'Zeynep Kaya' },
];

// Sistem Günlük Kayıtları (System Activity Logs)
const initialLogs = [
  { id: 1, time: '2026-06-03 14:10', message: 'Sistem başlatıldı.' },
  { id: 2, time: '2026-06-03 14:20', message: 'Yönetici Ahmet Yılmaz sisteme giriş yaptı.' },
];

export const AppProvider = ({ children }) => {
  // ── Tema Durumu (Karanlık/Aydınlık Mod) ──────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Önceki tercihi oku, yoksa sistem temasını kullan
    const savedTheme = localStorage.getItem('dm_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Varsayılan olarak aydınlık mod
    return false;
  });

  // Tema değiştiğinde HTML etiketine dark sınıfını ekle/çıkar
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('dm_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dm_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // ── Backend bağlantı durumu ────────────────────────────────────────────
  // true  → Sunucu çalışıyor, API istekleri backend'e gidecek
  // false → Sunucu kapalı, sistem localStorage/mock verisiyle çalışacak
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);
  // LocalStorage'dan veya varsayılan veriden state'leri başlatma
  // dueDate alanı eksik eski kayıtları otomatik düzelt
  const [residents, setResidents] = useState(() => {
    const local = localStorage.getItem('dm_residents');
    if (local) {
      const parsed = JSON.parse(local);
      // Eski kayıtlarda dueDate yoksa varsayılan ata
      return parsed.map(r => ({
        ...r,
        dueDate: r.dueDate || getDefaultDueDate()
      }));
    }
    return initialResidents;
  });

  const [transactions, setTransactions] = useState(() => {
    const local = localStorage.getItem('dm_transactions');
    return local ? JSON.parse(local) : initialTransactions;
  });

  const [requests, setRequests] = useState(() => {
    const local = localStorage.getItem('dm_requests');
    return local ? JSON.parse(local) : initialRequests;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('dm_announcements');
    return local ? JSON.parse(local) : initialAnnouncements;
  });

  const [reservations, setReservations] = useState(() => {
    const local = localStorage.getItem('dm_reservations');
    return local ? JSON.parse(local) : initialReservations;
  });

  const [logs, setLogs] = useState(() => {
    const local = localStorage.getItem('dm_logs');
    return local ? JSON.parse(local) : initialLogs;
  });

  // ── Backend sağlık kontrolü: uygulama ilk açıldığında bir kez çalışır ──
  useEffect(() => {
    checkBackendHealth().then(online => {
      setBackendOnline(online);
      setBackendChecked(true);
      if (online) {
        console.log('✅ Backend bağlantısı kuruldu (http://localhost:8000)');
        // Backend çevrimiçiyse güncel verileri sunucudan çek
        getResidents().then(r => r.success && setResidents(r.data)).catch(() => {});
        getTransactions().then(r => r.success && setTransactions(r.data)).catch(() => {});
        getRequests().then(r => r.success && setRequests(r.data)).catch(() => {});
        getAnnouncements().then(r => r.success && setAnnouncements(r.data)).catch(() => {});
        getReservations().then(r => r.success && setReservations(r.data)).catch(() => {});
        getLogs().then(r => r.success && setLogs(r.data)).catch(() => {});
      } else {
        console.warn('⚠️  Backend çevrimdışı — localStorage mock verisi kullanılıyor.');
      }
    });
  }, []);

  // ─── Kimlik Doğrulama State ──────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dm_auth') === 'true';
  });

  // Rol Yönetimi: 'sakin' (Ahmet Yılmaz) ya da 'yonetici'
  const [currentRole, setCurrentRole] = useState(() => {
    const local = localStorage.getItem('dm_current_role');
    return local ? local : 'sakin';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dm_current_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      unit: 'Blok A / Daire 1',
      name: 'Hilal Kurt',
      type: 'Mal Sahibi',
      email: 'hilal.kurt@example.com',
      phone: '0532 111 22 33',
    };
  });

  // ── Giriş Fonksiyonu ─────────────────────────────────────────────────
  // Backend çevrimiçiyse sunucuya istek atar; çevrimdışıysa yerel USERS listesine bakar
  const login = async (username, password) => {
    // ── 1. ADIM: Backend denemesi ──────────────────────────────────────
    if (backendOnline) {
      try {
        const result = await apiLogin(username, password);
        if (result.success) {
          const userInfo = {
            id:    result.user.id,
            name:  result.user.name,
            unit:  result.user.unit,
            type:  result.user.type,
            email: result.user.email,
            phone: result.user.phone,
          };
          // Token'ı localStorage'a kaydet (gerçek uygulamada güvenli storage kullanılır)
          localStorage.setItem('dm_token', result.token);
          setIsAuthenticated(true);
          setCurrentRole(result.user.role);
          setCurrentUser(userInfo);
          localStorage.setItem('dm_auth', 'true');
          localStorage.setItem('dm_current_role', result.user.role);
          localStorage.setItem('dm_current_user', JSON.stringify(userInfo));
          return { success: true, role: result.user.role };
        }
        return { success: false, message: result.message };
      } catch (err) {
        // Backend bağlantısı aniden koptu — mock'a düş
        console.warn('Backend login hatası, mock veriye geçiliyor:', err.message);
      }
    }

    // ── 2. ADIM: Mock/Offline giriş (backend yoksa) ────────────────────
    const user = USERS.find(
      u => u.username === username.trim() && u.password === password
    );
    if (!user) return { success: false, message: 'Kullanıcı adı veya şifre hatalı.' };

    const userInfo = {
      id: user.id, name: user.name, unit: user.unit,
      type: user.type, email: user.email, phone: user.phone,
    };
    setIsAuthenticated(true);
    setCurrentRole(user.role);
    setCurrentUser(userInfo);
    localStorage.setItem('dm_auth', 'true');
    localStorage.setItem('dm_current_role', user.role);
    localStorage.setItem('dm_current_user', JSON.stringify(userInfo));
    return { success: true, role: user.role };
  };

  // ── Çıkış Fonksiyonu ─────────────────────────────────────────────────
  const logout = async () => {
    // Backend varsa çıkış logu sunucuya bildir
    if (backendOnline) {
      try { await apiLogout(currentUser?.name); } catch {} 
    }
    setIsAuthenticated(false);
    setCurrentRole('sakin');
    localStorage.removeItem('dm_auth');
    localStorage.removeItem('dm_current_role');
    localStorage.removeItem('dm_current_user');
    localStorage.removeItem('dm_token');
  };

  // Global Toast / Bildirim Sistemi
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Gecikme Faizi Hesaplama Fonksiyonu
  // Borçlu daire için son ödeme tarihinden bugüne kadar geçen ay sayısına göre faiz hesaplar
  const computeLateInterest = (resident) => {
    if (!resident || resident.dues <= 0 || !resident.dueDate) return 0;
    const today = new Date();
    const due = new Date(resident.dueDate);
    if (today <= due) return 0; // Henüz gecikme yok
    // Geçen ay sayısını hesapla (maksimum 3 ay — gerçekçi sınır)
    const monthsLate = Math.min(
      3,
      Math.max(
        1,
        (today.getFullYear() - due.getFullYear()) * 12 + (today.getMonth() - due.getMonth())
      )
    );
    return Math.round(resident.dues * LATE_INTEREST_RATE * monthsLate);
  };

  // State değişimlerinde LocalStorage'a kaydetme
  useEffect(() => {
    localStorage.setItem('dm_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('dm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dm_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('dm_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('dm_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('dm_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('dm_current_role', currentRole);
  }, [currentRole]);

  // Log ekleme fonksiyonu
  const addLog = (message) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogs((prev) => [{ id: Date.now(), time: timeStr, message }, ...prev]);
  };

  // Sakin Ekle
  const addResident = (resident) => {
    const newRes = {
      ...resident,
      id: residents.length > 0 ? Math.max(...residents.map(r => r.id)) + 1 : 1,
      dues: resident.status === 'warning' ? (resident.dues || 1200) : 0
    };
    setResidents((prev) => [...prev, newRes]);
    addLog(`Yeni sakin eklendi: ${newRes.name} (${newRes.unit})`);
  };

  // Sakin Düzenle
  const updateResident = (updated) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...updated, dues: updated.status === 'paid' ? 0 : updated.dues } : r))
    );
    // Eğer düzenlediğimiz kişi mevcut kullanıcı ise onun profil bilgisini de güncelle
    if (updated.id === currentUser.id) {
      setCurrentUser(updated);
    }
    addLog(`Sakin bilgileri güncellendi: ${updated.name}`);
  };

  // Sakin Sil
  const deleteResident = (id) => {
    const resident = residents.find(r => r.id === id);
    setResidents((prev) => prev.filter((r) => r.id !== id));
    if (resident) {
      addLog(`Sakin silindi: ${resident.name} (${resident.unit})`);
    }
  };

  // Aidat Ödeme (Sakin Tarafından)
  const payResidentDues = (residentId, amountPaid, paymentMethod = 'Banka') => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          const newDues = Math.max(0, r.dues - amountPaid);
          return {
            ...r,
            dues: newDues,
            status: newDues === 0 ? 'paid' : 'warning',
          };
        }
        return r;
      })
    );

    const resident = residents.find(r => r.id === residentId);
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Aidat',
      amount: amountPaid,
      method: paymentMethod,
      description: `${resident ? resident.name : 'Sakin'} - Aidat Ödemesi`
    };

    setTransactions((prev) => [newTx, ...prev]);
    addLog(`${resident ? resident.name : 'Sakin'} ${amountPaid} TL aidat ödemesi gerçekleştirdi.`);
  };

  // Yeni Finansal İşlem Ekle (Yönetici Tarafından)
  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: Date.now(),
      amount: Number(tx.amount)
    };
    setTransactions((prev) => [newTx, ...prev]);
    addLog(`Yeni finansal işlem kaydedildi: ${newTx.type === 'income' ? 'Gelir' : 'Gider'} - ${newTx.category} (${newTx.amount} TL)`);
  };

  // Yeni Talep Oluştur
  const addRequest = (req) => {
    const newReq = {
      ...req,
      id: Date.now(),
      status: 'Beklemede',
      date: new Date().toISOString().split('T')[0],
      unit: currentUser.unit,
      residentName: currentUser.name
    };
    setRequests((prev) => [newReq, ...prev]);
    addLog(`Yeni talep oluşturuldu: "${newReq.title}" - Sakin: ${newReq.residentName}`);
  };

  // Talep Durumu Güncelle (Yönetici)
  const updateRequestStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    const req = requests.find(r => r.id === id);
    addLog(`Talep durumu güncellendi: "${req ? req.title : id}" -> ${newStatus}`);
  };

  // Yeni Rezervasyon Yap
  const addReservation = (res) => {
    const newRes = {
      ...res,
      id: Date.now(),
      unit: currentUser.unit,
      residentName: currentUser.name
    };
    setReservations((prev) => [...prev, newRes]);
    addLog(`Yeni rezervasyon yapıldı: ${newRes.facility} (${newRes.date} / ${newRes.timeSlot})`);
  };

  // Rezervasyon İptal Et
  const cancelReservation = (id) => {
    const res = reservations.find(r => r.id === id);
    setReservations((prev) => prev.filter((r) => r.id !== id));
    if (res) {
      addLog(`Rezervasyon iptal edildi: ${res.facility} (${res.date})`);
    }
  };

  // Yeni Duyuru Yayınla (Yönetici)
  const addAnnouncement = (ann) => {
    const newAnn = {
      ...ann,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addLog(`Yeni duyuru yayınlandı: "${newAnn.title}"`);
  };

  // Toplu Aidat Borçlandırması Yap (Yönetici)
  const generateMonthlyDues = (amount = 1200) => {
    const newDueDate = getDefaultDueDate();
    setResidents((prev) =>
      prev.map((r) => ({
        ...r,
        dues: r.dues + amount,
        status: 'warning',
        dueDate: newDueDate
      }))
    );
    addLog(`Tüm sakinler için aylık ${amount} TL aidat borçlandırılması yapıldı.`);
  };

  // Gecikmiş Aidat Hatırlatması (Simülasyon SMS Gönderimi)
  const sendDuesReminder = (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    if (resident) {
      addLog(`Borç hatırlatma uyarısı gönderildi: ${resident.name} (${resident.phone})`);
    }
  };

  return (
    // backendOnline ve backendChecked değerlerini de context'e ekle
    <AppContext.Provider
      value={{
        residents,
        transactions,
        requests,
        announcements,
        reservations,
        logs,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        addResident,
        updateResident,
        deleteResident,
        payResidentDues,
        addTransaction,
        addRequest,
        updateRequestStatus,
        addReservation,
        cancelReservation,
        addAnnouncement,
        generateMonthlyDues,
        sendDuesReminder,
        // Gecikme faizi
        computeLateInterest,
        LATE_INTEREST_RATE,
        // Global bildirim
        toast,
        showNotification,
        // Kimlik doğrulama
        isAuthenticated,
        login,
        logout,
        // Backend bağlantı durumu (sunum için kullanışlı)
        backendOnline,
        backendChecked,
        // Tema Durumu
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
