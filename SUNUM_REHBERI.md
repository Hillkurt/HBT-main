# 📋 SUNUM REHBERİ — Dijital Yönetim Sistemi

> **Hazırlayan:** Hilal Kurt — Ankara Medipol Üniversitesi  
> **Proje:** Apartman & Site Dijital Yönetim Sistemi  
> **Sunum Tarihi:** Dönem Sonu

---

## 🗂️ PROJE YAPISI (Hızlı Özet)

```
HBT-main/
├── 📁 backend_py/       ← Arka plan (sunucu) kodları (FastAPI + PostgreSQL)
│   ├── main.py          ← Ana sunucu dosyası (API bağlantıları)
│   ├── database.py      ← PostgreSQL veritabanı bağlantı ayarları
│   ├── models.py        ← SQLAlchemy ORM Tablo Yapıları
│   ├── schemas.py       ← Pydantic Doğrulama Modelleri
│   ├── crud.py          ← Veritabanı sorguları (Oluşturma, Okuma, Güncelleme, Silme)
│   └── routes/          ← API yönlendirmeleri
│
├── 📁 src/              ← Ön yüz (React) kodları
│   ├── services/
│   │   └── api.js       ← Frontend ↔ Backend köprüsü (Port 8000)
│   ├── context/
│   │   └── AppContext.jsx ← Uygulama geneli veri yönetimi
│   └── pages/           ← Ekranlar (Login, Admin, Sakin vb.)
│
├── BACKEND_PY_BASLAT.bat ← Backend'i tek tıkla başlatan dosya
└── SUNUM_REHBERI.md     ← Bu dosya
```

---

## 🚀 BÖLÜM 1: SİSTEMİ BAŞLATMA (Sunum öncesi yapılacaklar)

### Adım 1 — Backend Sunucusunu Başlat

Proje klasöründeki `BACKEND_PY_BASLAT.bat` dosyasına **çift tıklayarak** sunucuyu başlatabilirsin.

Veya terminalden başlatmak için:
```bash
# Proje klasörüne git
cd HBT-main/backend_py

# Gerekli kütüphaneleri yükle (Sadece bir kez)
py -m pip install -r requirements.txt

# Sunucuyu başlat
py -m uvicorn main:app --port 8000 --reload
```

✅ Terminalde şunu görmelisin:
```
=======================================================
   DIJITAL YONETIM --- FastAPI + PostgreSQL BACKEND
   Sunucu : http://localhost:8000
   Docs   : http://localhost:8000/docs
   Health : http://localhost:8000/api/health
=======================================================
```

### Adım 2 — Frontend'i Başlat (Ayrı terminal)

```bash
# Ana proje klasöründe
cd HBT-main
npm run dev
```

✅ Frontend: **http://localhost:5173** adresinde açılır.

### Adım 3 — Backend Bağlantısını Doğrula

Tarayıcıda aç: **http://localhost:8000/api/health**

Yanıt olarak şunu görmelisin:
```json
{
  "success": true,
  "message": "✅ Dijital Yönetim FastAPI Backend çalışıyor!",
  "database_status": "✅ PostgreSQL/SQLite Bağlantısı Başarılı",
  "framework": "FastAPI",
  "timestamp": "2026-06-04T...",
  "docs": "http://localhost:8000/docs"
}
```

---

## 🎓 BÖLÜM 2: HOCAYA GÖSTERILECEK ADIMLAR (Sırasıyla)

### 🔐 Adım 1: Giriş Ekranı & Backend Doğrulaması

1. **http://localhost:5173** adresini tarayıcıda aç
2. **Demo hesaplarla giriş yap:**

| Rol | Kullanıcı Adı | Şifre |
|-----|--------------|-------|
| Sakin | `hilal.kurt` | `1234` |
| Yönetici | `yonetici` | `admin123` |

---

### 📡 Adım 2: FastAPI Swagger UI'ı Göster (ÇOK ETKİLEYİCİ)

Hocaya tarayıcıda otomatik oluşturulan API dökümanını göster:

👉 **http://localhost:8000/docs**

Hocaya şunu açıkla:
> *"FastAPI framework'ünü kullanarak tüm backend mimarisini kurguladım. FastAPI, yazdığım Python kodlarına bakarak bu Swagger UI dökümanını otomatik oluşturuyor. Buradan tüm endpointleri test edebiliyoruz ve hangi verilerin gönderilmesi gerektiğini görebiliyoruz."*

---

### 👤 Adım 3: Yönetici Paneli Gösterisi

Yönetici (`yonetici` / `admin123`) ile giriş yap ve şunları göster:

1. **Sakinler Listesi** (`/residents-list`):
   - Yeni sakin ekle → Veritabanına kaydedildiğini göster
   - Sakini sil → Gerçek zamanlı silindiğini göster

2. **Finansal Tablo** (`/financial`):
   - Yeni gelir/gider ekle → Grafik güncellenir

3. **Duyurular** (`/announcements`):
   - Yeni duyuru yayınla → Sistem loguna düşer

4. **Admin Panel** (`/admin`):
   - Sistem loglarını göster
   - Son işlemlerin listelendiğini açıkla

---

### 🏠 Adım 4: Sakin Paneli Gösterisi

Sakin (`hilal.kurt` / `1234`) ile giriş yap:

1. **Ana Panel** (`/resident`): Aidat borcu, duyurular, durum
2. **Servisler** (`/services`): Rezervasyon yap → İptal et
3. **Talepler** (`/requests`): Arıza/şikayet bildirimi oluştur
4. **Duyurular** (`/announcements`): Okunur görünüm

---

### 📂 Adım 5: Veritabanını Canlı Göster

Hocaya `backend_py/models.py` dosyasını göstererek veritabanı tablolarının nasıl oluşturulduğunu anlat:

> *"Veritabanı için PostgreSQL hiyerarşisi kullandım. SQLAlchemy ORM kullanarak `models.py` içerisinde veritabanı tablolarını Python sınıfları olarak tanımladım. Bu sayede SQL sorguları yazmak yerine nesne yönelimli bir şekilde veritabanı ile iletişim kurabiliyorum. Veri doğrulaması için de FastAPI'nin kendi altyapısı olan Pydantic (schemas.py) kullanıldı."*

---

## 🔌 BÖLÜM 3: API REFERANS TABLOSU

| HTTP Metodu | URL | Ne Yapar? |
|-------------|-----|-----------|
| `GET` | `/api/health` | Sunucu sağlık kontrolü |
| `POST` | `/api/auth/login` | Kullanıcı girişi (token döner) |
| `POST` | `/api/auth/logout` | Kullanıcı çıkışı (log kaydeder) |
| `GET` | `/api/residents` | Tüm sakinleri listele |
| `POST` | `/api/residents` | Yeni sakin ekle |
| `PUT` | `/api/residents/:id` | Sakin bilgilerini güncelle |
| `DELETE` | `/api/residents/:id` | Sakin sil |
| `POST` | `/api/residents/:id/pay` | Sakin aidat ödemesi yap |
| `GET` | `/api/transactions` | Finansal işlemleri listele |
| `POST` | `/api/transactions` | Yeni gelir/gider ekle |
| `GET` | `/api/requests` | Tüm talepleri listele |
| `POST` | `/api/requests` | Yeni talep oluştur |
| `PATCH` | `/api/requests/:id/status` | Talep durumunu güncelle |
| `GET` | `/api/announcements` | Duyuruları listele |
| `POST` | `/api/announcements` | Yeni duyuru yayınla |
| `GET` | `/api/reservations` | Rezervasyonları listele |
| `POST` | `/api/reservations` | Rezervasyon yap |
| `DELETE` | `/api/reservations/:id` | Rezervasyon iptal et |
| `POST` | `/api/dues/generate` | Toplu aidat borçlandır |
| `GET` | `/api/logs` | Sistem loglarını getir |

---

## 💡 BÖLÜM 4: HOCADAN GELEBILECEK SORULAR & CEVAPLAR

**S: "Neden Node.js yerine Python (FastAPI) kullandın?"**  
C: *"PDF gereksinimlerinde özellikle belirtildiği için projeyi bu standartlara uyarladım. Ayrıca FastAPI günümüzde çok popüler, yüksek performanslı ve asenkron yapısıyla büyük verileri bile çok hızlı işleyebiliyor. Üstelik Swagger (Docs) ile otomatik dökümantasyon sağlıyor."*

---

**S: "Veritabanı yapın nasıl kurgulandı?"**  
C: *"SQLAlchemy (Object-Relational Mapping - ORM) kullandım. Bu sayede `models.py` dosyasında veritabanı tablolarını sınıflar halinde tasarladım. Bu yöntem bizi hem SQL injection gibi güvenlik açıklarından koruyor hem de veritabanını daha sonrasında kolayca (örneğin PostgreSQL'e) migrate edebilmemizi sağlıyor."*

---

**S: "CORS nedir?"**  
C: *"Frontend (React) port 5173'te, backend port 8000'de çalışıyor. Tarayıcı 
güvenlik nedeniyle farklı portlar arasındaki iletişimi varsayılan olarak engeller. `main.py` içerisindeki CORS (Cross-Origin Resource Sharing) ayarı sayesinde backend, frontend'in isteklerine izin veriyor."*

---

## ⚡ BÖLÜM 5: ACİL SORUN GİDERME

| Sorun | Çözüm |
|-------|-------|
| Python modülü bulunamadı | `cd backend_py` yapıp `py -m pip install -r requirements.txt` çalıştır |
| "Port 8000 kullanımda" | `netstat -ano \| findstr :8000` ile portu bul, işlemi sonlandır |
| Veritabanı başlatma hatası | `backend_py` içindeki `hbt_app.db` dosyasını silip sunucuyu yeniden başlat (Orijinal mock veriler otomatik geri yüklenecektir) |

---

*Bu rehber `SUNUM_REHBERI.md` dosyasıdır — proje kök dizininde bulunur.*
