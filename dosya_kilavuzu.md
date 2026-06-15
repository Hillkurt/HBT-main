# 🗺️ HBT-main: Proje Dosya ve Kod Haritası

Bu kılavuz, projenizde **"Hangi sayfa nerede?", "Tasarımı nereden değiştiririm?", "Veritabanı işlemleri nerede?"** gibi soruların cevaplarını içerir.

Aşağıdaki bağlantılara **tıkladığınızda**, ilgili dosya doğrudan editörünüzde (VS Code) açılacaktır. Bu dosyaları inceleyerek kodların nasıl yazıldığını görebilirsiniz.

---

## 🖥️ 1. FRONTEND (Kullanıcının Gördüğü Ekranlar)

Arayüz dosyalarının tamamı **React** ile yazılmış olup `src/` klasörü altındadır.

### 📍 Temel Yapı Taşı
* **Yönlendirmeler (Routing):** [src/App.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/App.jsx)
  *(Hangi URL'ye girildiğinde hangi sayfanın açılacağını ve kimin hangi sayfaya yetkisi olduğunu belirleyen en önemli dosyadır.)*
* **Genel Tasarım (CSS):** [src/index.css](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/index.css)
  *(TailwindCSS ayarlarının yapıldığı ve genel renk/font tanımlarının olduğu dosyadır.)*

### 📄 Ana Sayfalar (Ekranlar)
Her bir ekran ayrı bir `.jsx` dosyası olarak tasarlanmıştır.

* 🔐 **Giriş Ekranı (Login):** [src/pages/GirisEkrani.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/GirisEkrani.jsx)
* 👑 **Yönetici Paneli (Ana Ekran):** [src/pages/YoneticiPaneli.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/YoneticiPaneli.jsx)
* 👨‍👩‍👧‍👦 **Sakin Paneli (Ana Ekran):** [src/pages/SakinPaneli.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/SakinPaneli.jsx)
* 📋 **Sakinler Listesi:** [src/pages/SakinListesi.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/SakinListesi.jsx)
* 💰 **Finansal Durum (Kasa):** [src/pages/FinansalDashboard.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/FinansalDashboard.jsx)
* 🛠️ **Talepler & Şikayetler:** [src/pages/Talepler.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/Talepler.jsx)
* 🏊 **Hizmetler (Rezervasyonlar):** [src/pages/Hizmetler.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/Hizmetler.jsx)
* 📢 **Duyurular Panosu:** [src/pages/Duyurular.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/Duyurular.jsx)

> **Nasıl Yazılmışlar?** Bu dosyaları açtığınızda üst kısımda verilerin (state) nasıl tutulduğunu, alt kısımdaki `return (...)` blokları içerisinde ise ekranın HTML/TailwindCSS tasarımıyla nasıl çizildiğini göreceksiniz.

---

## ⚙️ 2. BACKEND (Arka Plan ve Veritabanı)

Arka plan işlemleri **Python FastAPI** ile yazılmış olup `backend_py/` klasörü altındadır.

### 📍 Temel Yapı Taşları
* **Ana Sunucu:** [backend_py/main.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/main.py)
  *(Sunucuyu başlatan, tüm ayarları yapan ve veritabanı bağlantısını kuran "kalp" dosyadır.)*
* **Veritabanı Tabloları:** [backend_py/models.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/models.py)
  *(Kullanıcılar, Sakinler, Talepler gibi verilerin veritabanında hangi sütunlarla (İsim, Tarih, Tutar vb.) tutulacağını belirleyen dosyadır.)*
* **Veritabanı İşlemleri (CRUD):** [backend_py/crud.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/crud.py)
  *(Veriyi kaydetme, silme, güncelleme ve okuma işlevlerini yapan fonksiyonlar buradadır.)*

### 🔗 İstek Yolları (API Endpoints)
Ön yüzden gelen isteklerin (Örn: "Bana tüm sakinleri getir" isteği) karşılandığı dosyalardır.

* 🔐 **Giriş İşlemleri:** [backend_py/routes/auth.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/auth.py)
* 📋 **Sakin İşlemleri:** [backend_py/routes/residents.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/residents.py)
* 💰 **Finansal (Gelir/Gider) İşlemleri:** [backend_py/routes/transactions.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/transactions.py)
* 🛠️ **Talep İşlemleri:** [backend_py/routes/requests_.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/requests_.py)
* 📢 **Duyuru İşlemleri:** [backend_py/routes/announcements.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/announcements.py)
* 🏊 **Rezervasyon İşlemleri:** [backend_py/routes/reservations.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/reservations.py)

---

## 💡 Pratik Egzersiz (Sunum Öncesi)
Hoca sunumda "Bana yeni bir duyuru eklediğiniz kodu nerede yazdığınızı göster" derse, sırasıyla şu bağlantılara tıklayabilirsiniz:
1. **Frontend:** [src/pages/Duyurular.jsx](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/src/pages/Duyurular.jsx) dosyasında formun olduğu HTML kısmını gösterirsiniz.
2. **Backend:** [backend_py/routes/announcements.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/routes/announcements.py) dosyasında `router.post("/")` fonksiyonunu (isteğin geldiği yer) gösterirsiniz.
3. **Veritabanı:** [backend_py/crud.py](file:///c:/Users/hilal/OneDrive/Masa%C3%BCst%C3%BC/HBT-main/backend_py/crud.py) dosyasında `create_announcement` fonksiyonunu (verinin veritabanına kaydedildiği yer) gösterirsiniz.
