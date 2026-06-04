// ============================================================
//  server.js — Ana Sunucu Dosyası
//  Dijital Yönetim Sistemi Mock Backend
//
//  Kullanılan teknoloji: Node.js + Express
//  Veri kaynağı       : backend/db.json (gerçek DB yerine)
//
//  Sunucu başlatmak için terminalde şu komutu çalıştırın:
//    cd backend
//    npm install
//    npm start
//
//  Sunucu http://localhost:5000 adresinde çalışır.
// ============================================================

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 5000;

// ── db.json dosyasının tam yolu ────────────────────────────
const DB_PATH = path.join(__dirname, 'db.json');

// ── Middleware'ler ─────────────────────────────────────────
// JSON formatındaki istekleri otomatik olarak parse et
app.use(express.json());

// Frontend (React - port 5173) ile konuşabilmek için CORS izni ver
app.use(cors({ origin: 'http://localhost:5173' }));

// ── Yardımcı Fonksiyonlar ──────────────────────────────────

/**
 * Veritabanını oku: db.json dosyasını okuyup JavaScript nesnesine çevirir.
 * Her istek sırasında çağrılır, böylece en güncel veri alınır.
 */
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Veritabanına yaz: JavaScript nesnesini JSON formatında db.json'a kaydeder.
 * POST/PUT/DELETE işlemlerinden sonra çağrılır.
 */
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Zaman damgası üret: Log kayıtları için "YYYY-MM-DD HH:MM" formatında
 * anlık tarih-saat döndürür.
 */
function timestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ` +
         `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

/**
 * Aktivite logu ekle: Sistemde yapılan her önemli işlemi db.json'daki
 * logs dizisine kaydeder. Yönetici panelinde gözükür.
 */
function addLog(db, message) {
  db.logs.unshift({ id: Date.now(), time: timestamp(), message });
}

// ============================================================
//  ROTA GRUBU 1: KİMLİK DOĞRULAMA (Authentication)
// ============================================================

/**
 * POST /api/auth/login — Kullanıcı Girişi
 *
 * Gelen kullanıcı adı ve şifreyi db.json'daki users tablosunda arar.
 * Eşleşme varsa kullanıcı bilgilerini döndürür (şifre hariç).
 * Eşleşme yoksa 401 Yetkisiz hatası verir.
 *
 * İstek gövdesi: { username: "...", password: "..." }
 * Başarılı yanıt: { success: true, user: {...}, token: "mock-token-..." }
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Giriş bilgilerinin dolu olup olmadığını kontrol et
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const db   = readDB();
  // Kullanıcıyı veritabanında ara (büyük/küçük harf duyarsız için trim uygula)
  const user = db.users.find(
    u => u.username === username.trim() && u.password === password
  );

  // Kullanıcı bulunamazsa hata döndür
  if (!user) {
    return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
  }

  // Başarılı girişi log kayıtlarına ekle
  addLog(db, `${user.name} (${user.role}) sisteme giriş yaptı.`);
  writeDB(db);

  // Şifreyi yanıta dahil etme — güvenlik prensibi
  const { password: _pass, ...safeUser } = user;

  res.json({
    success: true,
    user:  safeUser,
    // Gerçek projede JWT token kullanılır; burada mock token üretiyoruz
    token: `mock-token-${user.id}-${Date.now()}`
  });
});

/**
 * POST /api/auth/logout — Kullanıcı Çıkışı
 *
 * Gerçek bir JWT sisteminde token burada geçersiz kılınır.
 * Mock sistemde sadece log kaydı tutulur.
 */
app.post('/api/auth/logout', (req, res) => {
  const { username } = req.body;
  const db = readDB();
  addLog(db, `${username || 'Kullanıcı'} sistemden çıkış yaptı.`);
  writeDB(db);
  res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});

// ============================================================
//  ROTA GRUBU 2: SAKİNLER (Residents)
// ============================================================

/**
 * GET /api/residents — Tüm Sakinleri Listele
 * Veritabanındaki tüm sakin kayıtlarını döndürür.
 */
app.get('/api/residents', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.residents });
});

/**
 * GET /api/residents/:id — Tek Sakin Getir
 * Verilen ID'ye sahip sakin kaydını döndürür.
 */
app.get('/api/residents/:id', (req, res) => {
  const db       = readDB();
  const resident = db.residents.find(r => r.id === Number(req.params.id));
  if (!resident) return res.status(404).json({ success: false, message: 'Sakin bulunamadı.' });
  res.json({ success: true, data: resident });
});

/**
 * POST /api/residents — Yeni Sakin Ekle
 * Gelen sakin verilerini doğrular ve veritabanına ekler.
 *
 * İstek gövdesi: { name, unit, type, email, phone, status, dues, dueDate }
 */
app.post('/api/residents', (req, res) => {
  const db      = readDB();
  const { name, unit, type, email, phone, status, dues, dueDate } = req.body;

  // Zorunlu alan kontrolü
  if (!name || !unit) {
    return res.status(400).json({ success: false, message: 'Ad ve daire bilgisi zorunludur.' });
  }

  // Mevcut en büyük ID'nin üzerine 1 ekleyerek yeni ID üret
  const newId      = db.residents.length > 0 ? Math.max(...db.residents.map(r => r.id)) + 1 : 1;
  const newResident = {
    id: newId,
    name, unit,
    type:    type    || 'Kiracı',
    email:   email   || '',
    phone:   phone   || '',
    status:  status  || 'paid',
    dues:    status === 'warning' ? (dues || 1200) : 0,
    dueDate: dueDate || new Date().toISOString().split('T')[0]
  };

  db.residents.push(newResident);
  addLog(db, `Yeni sakin eklendi: ${newResident.name} (${newResident.unit})`);
  writeDB(db);

  res.status(201).json({ success: true, data: newResident });
});

/**
 * PUT /api/residents/:id — Sakin Bilgilerini Güncelle
 * Belirtilen ID'li sakinin tüm alanlarını günceller.
 */
app.put('/api/residents/:id', (req, res) => {
  const db  = readDB();
  const idx = db.residents.findIndex(r => r.id === Number(req.params.id));

  if (idx === -1) return res.status(404).json({ success: false, message: 'Sakin bulunamadı.' });

  // Mevcut kaydı gelen verilerle birleştir (kısmi güncellemeye izin ver)
  db.residents[idx] = {
    ...db.residents[idx],
    ...req.body,
    id: Number(req.params.id), // ID'nin değişmemesini garanti et
    dues: req.body.status === 'paid' ? 0 : (req.body.dues ?? db.residents[idx].dues)
  };

  addLog(db, `Sakin bilgileri güncellendi: ${db.residents[idx].name}`);
  writeDB(db);
  res.json({ success: true, data: db.residents[idx] });
});

/**
 * DELETE /api/residents/:id — Sakin Sil
 * Belirtilen ID'li sakin kaydını veritabanından kaldırır.
 */
app.delete('/api/residents/:id', (req, res) => {
  const db       = readDB();
  const resident = db.residents.find(r => r.id === Number(req.params.id));

  if (!resident) return res.status(404).json({ success: false, message: 'Sakin bulunamadı.' });

  db.residents = db.residents.filter(r => r.id !== Number(req.params.id));
  addLog(db, `Sakin silindi: ${resident.name} (${resident.unit})`);
  writeDB(db);

  res.json({ success: true, message: `${resident.name} başarıyla silindi.` });
});

// ============================================================
//  ROTA GRUBU 3: FİNANSAL İŞLEMLER (Transactions)
// ============================================================

/**
 * GET /api/transactions — Tüm Finansal İşlemleri Listele
 * İsteğe bağlı sorgu parametreleriyle filtreleme destekler:
 *   ?type=income   → Sadece gelirleri getir
 *   ?type=expense  → Sadece giderleri getir
 */
app.get('/api/transactions', (req, res) => {
  const db   = readDB();
  let   data = db.transactions;

  // URL'de ?type=... parametresi varsa filtrele
  if (req.query.type) {
    data = data.filter(t => t.type === req.query.type);
  }

  res.json({ success: true, data });
});

/**
 * POST /api/transactions — Yeni Finansal İşlem Ekle
 * Gelir veya gider kaydı oluşturur.
 *
 * İstek gövdesi: { type, category, amount, method, description, date? }
 */
app.post('/api/transactions', (req, res) => {
  const db = readDB();
  const { type, category, amount, method, description } = req.body;

  // Zorunlu alan kontrolü
  if (!type || !amount) {
    return res.status(400).json({ success: false, message: 'İşlem tipi ve tutar zorunludur.' });
  }

  const newTx = {
    id:          Date.now(),
    date:        req.body.date || new Date().toISOString().split('T')[0],
    type,
    category:    category    || 'Diğer',
    amount:      Number(amount),
    method:      method      || 'Nakit',
    description: description || ''
  };

  db.transactions.unshift(newTx); // En yeni işlem başa ekle
  addLog(db, `Yeni finansal işlem: ${type === 'income' ? 'Gelir' : 'Gider'} - ${category} (${amount} TL)`);
  writeDB(db);

  res.status(201).json({ success: true, data: newTx });
});

/**
 * DELETE /api/transactions/:id — Finansal İşlem Sil
 */
app.delete('/api/transactions/:id', (req, res) => {
  const db = readDB();
  const tx = db.transactions.find(t => t.id === Number(req.params.id));

  if (!tx) return res.status(404).json({ success: false, message: 'İşlem bulunamadı.' });

  db.transactions = db.transactions.filter(t => t.id !== Number(req.params.id));
  addLog(db, `Finansal işlem silindi: ${tx.description}`);
  writeDB(db);

  res.json({ success: true, message: 'İşlem silindi.' });
});

// ============================================================
//  ROTA GRUBU 4: TALEPLER (Requests / Complaints)
// ============================================================

/**
 * GET /api/requests — Tüm Talepleri Listele
 */
app.get('/api/requests', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.requests });
});

/**
 * POST /api/requests — Yeni Talep Oluştur
 * Sakin tarafından yapılan arıza/şikayet/öneri talebi kaydeder.
 */
app.post('/api/requests', (req, res) => {
  const db = readDB();
  const { title, description, category, priority, unit, residentName } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Talep başlığı zorunludur.' });

  const newReq = {
    id:           Date.now(),
    title,
    description:  description  || '',
    category:     category     || 'Genel',
    priority:     priority     || 'Orta',
    status:       'Beklemede', // Yeni talepler her zaman "Beklemede" ile başlar
    date:         new Date().toISOString().split('T')[0],
    unit:         unit         || '',
    residentName: residentName || ''
  };

  db.requests.unshift(newReq);
  addLog(db, `Yeni talep oluşturuldu: "${newReq.title}" - ${newReq.residentName}`);
  writeDB(db);

  res.status(201).json({ success: true, data: newReq });
});

/**
 * PATCH /api/requests/:id/status — Talep Durumunu Güncelle
 * Yönetici tarafından talebin durumunu değiştirir.
 * Durumlar: "Beklemede" → "İşlemde" → "Tamamlandı"
 *
 * İstek gövdesi: { status: "İşlemde" }
 */
app.patch('/api/requests/:id/status', (req, res) => {
  const db  = readDB();
  const idx = db.requests.findIndex(r => r.id === Number(req.params.id));

  if (idx === -1) return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Durum bilgisi gerekli.' });

  db.requests[idx].status = status;
  addLog(db, `Talep durumu güncellendi: "${db.requests[idx].title}" → ${status}`);
  writeDB(db);

  res.json({ success: true, data: db.requests[idx] });
});

/**
 * DELETE /api/requests/:id — Talep Sil
 */
app.delete('/api/requests/:id', (req, res) => {
  const db  = readDB();
  const req_ = db.requests.find(r => r.id === Number(req.params.id));

  if (!req_) return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });

  db.requests = db.requests.filter(r => r.id !== Number(req.params.id));
  addLog(db, `Talep silindi: "${req_.title}"`);
  writeDB(db);

  res.json({ success: true, message: 'Talep silindi.' });
});

// ============================================================
//  ROTA GRUBU 5: DUYURULAR (Announcements)
// ============================================================

/**
 * GET /api/announcements — Tüm Duyuruları Listele
 */
app.get('/api/announcements', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.announcements });
});

/**
 * POST /api/announcements — Yeni Duyuru Yayınla (Sadece Yönetici)
 */
app.post('/api/announcements', (req, res) => {
  const db = readDB();
  const { title, content, category, priority } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Başlık ve içerik zorunludur.' });
  }

  const newAnn = {
    id:       Date.now(),
    title,
    content,
    category: category || 'Genel',
    priority: priority || 'Normal',
    date:     new Date().toISOString().split('T')[0]
  };

  db.announcements.unshift(newAnn);
  addLog(db, `Yeni duyuru yayınlandı: "${newAnn.title}"`);
  writeDB(db);

  res.status(201).json({ success: true, data: newAnn });
});

/**
 * DELETE /api/announcements/:id — Duyuru Sil
 */
app.delete('/api/announcements/:id', (req, res) => {
  const db  = readDB();
  const ann = db.announcements.find(a => a.id === Number(req.params.id));

  if (!ann) return res.status(404).json({ success: false, message: 'Duyuru bulunamadı.' });

  db.announcements = db.announcements.filter(a => a.id !== Number(req.params.id));
  addLog(db, `Duyuru silindi: "${ann.title}"`);
  writeDB(db);

  res.json({ success: true, message: 'Duyuru silindi.' });
});

// ============================================================
//  ROTA GRUBU 6: REZERVASYONLAR (Reservations)
// ============================================================

/**
 * GET /api/reservations — Tüm Rezervasyonları Listele
 */
app.get('/api/reservations', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.reservations });
});

/**
 * POST /api/reservations — Yeni Rezervasyon Yap
 */
app.post('/api/reservations', (req, res) => {
  const db = readDB();
  const { facility, date, timeSlot, unit, residentName } = req.body;

  if (!facility || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Tesis, tarih ve saat bilgisi zorunludur.' });
  }

  // Aynı tesis, tarih ve saat için çakışma kontrolü
  const conflict = db.reservations.find(
    r => r.facility === facility && r.date === date && r.timeSlot === timeSlot
  );
  if (conflict) {
    return res.status(409).json({ success: false, message: 'Bu saat dilimi zaten dolu.' });
  }

  const newRes = {
    id: Date.now(),
    facility, date, timeSlot,
    unit:         unit         || '',
    residentName: residentName || ''
  };

  db.reservations.push(newRes);
  addLog(db, `Rezervasyon yapıldı: ${newRes.facility} - ${newRes.date} / ${newRes.timeSlot}`);
  writeDB(db);

  res.status(201).json({ success: true, data: newRes });
});

/**
 * DELETE /api/reservations/:id — Rezervasyon İptal Et
 */
app.delete('/api/reservations/:id', (req, res) => {
  const db  = readDB();
  const res_ = db.reservations.find(r => r.id === Number(req.params.id));

  if (!res_) return res.status(404).json({ success: false, message: 'Rezervasyon bulunamadı.' });

  db.reservations = db.reservations.filter(r => r.id !== Number(req.params.id));
  addLog(db, `Rezervasyon iptal edildi: ${res_.facility} - ${res_.date}`);
  writeDB(db);

  res.json({ success: true, message: 'Rezervasyon iptal edildi.' });
});

// ============================================================
//  ROTA GRUBU 7: AKTİVİTE LOGLARI (System Logs)
// ============================================================

/**
 * GET /api/logs — Sistem Loglarını Getir
 * Yönetici panelindeki aktivite akışı için kullanılır.
 * ?limit=20 parametresiyle son N logu çekebilirsiniz.
 */
app.get('/api/logs', (req, res) => {
  const db    = readDB();
  const limit = req.query.limit ? Number(req.query.limit) : db.logs.length;
  res.json({ success: true, data: db.logs.slice(0, limit) });
});

// ============================================================
//  ROTA GRUBU 8: AİDAT İŞLEMLERİ (Dues Management)
// ============================================================

/**
 * POST /api/residents/:id/pay — Sakin Aidat Ödemesi
 * Belirtilen sakinin aidat borcundan ödenen tutarı düşer.
 * Eğer borç sıfırlanırsa status otomatik "paid" olur.
 *
 * İstek gövdesi: { amount: 1200, method: "Banka" }
 */
app.post('/api/residents/:id/pay', (req, res) => {
  const db  = readDB();
  const idx = db.residents.findIndex(r => r.id === Number(req.params.id));

  if (idx === -1) return res.status(404).json({ success: false, message: 'Sakin bulunamadı.' });

  const { amount, method = 'Banka' } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Geçerli bir ödeme tutarı giriniz.' });
  }

  const resident  = db.residents[idx];
  const newDues   = Math.max(0, resident.dues - Number(amount));
  db.residents[idx] = { ...resident, dues: newDues, status: newDues === 0 ? 'paid' : 'warning' };

  // Ödeme geçmişine finansal işlem olarak kaydet
  db.transactions.unshift({
    id:          Date.now(),
    date:        new Date().toISOString().split('T')[0],
    type:        'income',
    category:    'Aidat',
    amount:      Number(amount),
    method,
    description: `${resident.name} - Aidat Ödemesi`
  });

  addLog(db, `${resident.name} ${amount} TL aidat ödemesi gerçekleştirdi.`);
  writeDB(db);

  res.json({ success: true, data: db.residents[idx] });
});

/**
 * POST /api/dues/generate — Toplu Aidat Borçlandırma (Yönetici)
 * Tüm sakinlere belirtilen tutarda aidat borcu oluşturur.
 *
 * İstek gövdesi: { amount: 1200 }
 */
app.post('/api/dues/generate', (req, res) => {
  const db     = readDB();
  const amount = Number(req.body.amount) || 1200;

  // Her sakin için borç ekle ve son ödeme tarihini güncelle
  const dueDate = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-15`;
  db.residents  = db.residents.map(r => ({
    ...r,
    dues:    r.dues + amount,
    status:  'warning',
    dueDate: dueDate
  }));

  addLog(db, `Toplu aidat borçlandırması yapıldı: Tüm sakinler için ${amount} TL.`);
  writeDB(db);

  res.json({ success: true, message: `${amount} TL aidat tüm sakinlere eklendi.`, data: db.residents });
});

// ============================================================
//  SAĞLIK KONTROLÜ — Sunucunun çalışıp çalışmadığını test eder
// ============================================================

/**
 * GET /api/health — Sunucu Sağlık Kontrolü
 * Tarayıcıdan http://localhost:5000/api/health açarak sunucunun
 * ayakta olup olmadığını kontrol edebilirsiniz.
 */
app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    message:   '✅ Dijital Yönetim Backend çalışıyor!',
    timestamp: new Date().toISOString(),
    version:   '1.0.0'
  });
});

// ── Sunucuyu Başlat ────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🏢 ===================================================');
  console.log('   DİJİTAL YÖNETİM SİSTEMİ — MOCK BACKEND');
  console.log(`   Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log('   Sağlık kontrolü: http://localhost:5000/api/health');
  console.log('   Veritabanı     : backend/db.json');
  console.log('🏢 ===================================================');
  console.log('');
});
