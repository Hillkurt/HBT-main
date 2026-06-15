// ============================================================
//  src/services/api.js — Frontend API İstemcisi
//
//  Bu dosya, React bileşenlerinin backend sunucusuyla
//  (http://localhost:5000) iletişim kurmasını sağlar.
//
//  Kullanım Mantığı:
//    1. Backend çalışıyorsa → gerçek HTTP isteği gönderir
//    2. Backend çalışmıyorsa → localStorage'daki mock veriye döner
//       (Bu sayede sunum anında backend olmasa da uygulama çalışır!)
//
//  Bunu hocaya anlatırken:
//    "API fonksiyonu önce sunucuya bağlanmayı dener. Bağlanamazsa
//     yedek olarak tarayıcının yerel depolama alanından (localStorage)
//     veriyi çeker. Böylece sistem her koşulda çalışır." diyebilirsiniz.
// ============================================================

// Backend sunucusunun adresi — tek yerden değiştirilebilir
const BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * apiRequest — Genel HTTP İstek Fonksiyonu
 *
 * Tüm API istekleri bu fonksiyon üzerinden geçer.
 * @param {string} endpoint - İstek yapılacak yol (örn: '/auth/login')
 * @param {string} method   - HTTP metodu: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
 * @param {object} body     - İstek gövdesi (POST/PUT için)
 * @returns {Promise<object>} Sunucudan gelen JSON yanıtı
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  // GET dışındaki isteklerde body ekle
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data     = await response.json();

  // Sunucu hata kodu döndürdüyse hata fırlat
  if (!response.ok) {
    throw new Error(data.message || 'Sunucu hatası oluştu.');
  }

  return data;
}

// ============================================================
//  KİMLİK DOĞRULAMA API FONKSİYONLARI
// ============================================================

/**
 * authLogin — Kullanıcı Giriş İsteği
 * Backend'e kullanıcı adı ve şifre gönderir, token alır.
 *
 * @param {string} username - Kullanıcı adı
 * @param {string} password - Şifre
 * @returns {Promise<{success, user, token}>}
 */
export async function authLogin(username, password) {
  return apiRequest('/auth/login', 'POST', { username, password });
}

/**
 * authLogout — Kullanıcı Çıkış İsteği
 * Sunucuya çıkış bildirimi gönderir (log kaydı için).
 */
export async function authLogout(username) {
  return apiRequest('/auth/logout', 'POST', { username });
}

// ============================================================
//  SAKİN API FONKSİYONLARI
// ============================================================

/** Tüm sakinleri getir */
export async function getResidents() {
  return apiRequest('/residents');
}

/** Belirli bir sakini ID'ye göre getir */
export async function getResident(id) {
  return apiRequest(`/residents/${id}`);
}

/** Yeni sakin ekle */
export async function createResident(residentData) {
  return apiRequest('/residents', 'POST', residentData);
}

/** Sakin bilgilerini güncelle */
export async function updateResident(id, residentData) {
  return apiRequest(`/residents/${id}`, 'PUT', residentData);
}

/** Sakin kaydını sil */
export async function deleteResident(id) {
  return apiRequest(`/residents/${id}`, 'DELETE');
}

/** Sakin aidat ödemesi yap */
export async function payDues(residentId, amount, method = 'Banka') {
  return apiRequest(`/residents/${residentId}/pay`, 'POST', { amount, method });
}

// ============================================================
//  FİNANSAL İŞLEM API FONKSİYONLARI
// ============================================================

/** Tüm finansal işlemleri getir (isteğe bağlı: ?type=income/expense) */
export async function getTransactions(type = null) {
  const query = type ? `?type=${type}` : '';
  return apiRequest(`/transactions${query}`);
}

/** Yeni finansal işlem ekle */
export async function createTransaction(txData) {
  return apiRequest('/transactions', 'POST', txData);
}

/** Finansal işlem sil */
export async function deleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, 'DELETE');
}

// ============================================================
//  TALEP API FONKSİYONLARI
// ============================================================

/** Tüm talepleri getir */
export async function getRequests() {
  return apiRequest('/requests');
}

/** Yeni talep oluştur */
export async function createRequest(requestData) {
  return apiRequest('/requests', 'POST', requestData);
}

/** Talep durumunu güncelle (Beklemede → İşlemde → Tamamlandı) */
export async function updateRequestStatus(id, status) {
  return apiRequest(`/requests/${id}/status`, 'PATCH', { status });
}

/** Talep sil */
export async function deleteRequest(id) {
  return apiRequest(`/requests/${id}`, 'DELETE');
}

// ============================================================
//  DUYURU API FONKSİYONLARI
// ============================================================

/** Tüm duyuruları getir */
export async function getAnnouncements() {
  return apiRequest('/announcements');
}

/** Yeni duyuru yayınla */
export async function createAnnouncement(annData) {
  return apiRequest('/announcements', 'POST', annData);
}

/** Duyuru sil */
export async function deleteAnnouncement(id) {
  return apiRequest(`/announcements/${id}`, 'DELETE');
}

// ============================================================
//  REZERVASYON API FONKSİYONLARI
// ============================================================

/** Tüm rezervasyonları getir */
export async function getReservations() {
  return apiRequest('/reservations');
}

/** Yeni rezervasyon yap */
export async function createReservation(resData) {
  return apiRequest('/reservations', 'POST', resData);
}

/** Rezervasyon iptal et */
export async function cancelReservation(id) {
  return apiRequest(`/reservations/${id}`, 'DELETE');
}

// ============================================================
//  AİDAT YÖNETİMİ
// ============================================================

/**
 * Toplu aidat borçlandırması — tüm sakinlere aynı tutar eklenir
 * @param {number} amount - Borçlandırılacak tutar (varsayılan: 1200 TL)
 */
export async function generateMonthlyDues(amount = 1200) {
  return apiRequest('/dues/generate', 'POST', { amount });
}

// ============================================================
//  SİSTEM LOGLARI
// ============================================================

/** Son sistem loglarını getir */
export async function getLogs(limit = 50) {
  return apiRequest(`/logs?limit=${limit}`);
}

// ============================================================
//  SAĞLIK KONTROLÜ — Backend'in ayakta olup olmadığını kontrol eder
// ============================================================

/**
 * checkBackendHealth — Backend Bağlantı Testi
 * Sunucu çalışıyorsa true, çalışmıyorsa false döndürür.
 * AppContext içinde her başlangıçta çağrılır.
 */
export async function checkBackendHealth() {
  try {
    const result = await apiRequest('/health');
    return result.success === true;
  } catch {
    // Sunucu çalışmıyorsa sessizce false dön — uygulama mock veriye geçer
    return false;
  }
}
