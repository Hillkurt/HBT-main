# 🎓 PROJE SUNUM VE KLASÖR REHBERİ

> Bu doküman, projeyi hocaya sunarken hem projenin mimarisini (klasör yapılarını) hem de ekranlardaki teknik/tasarımsal kararları en akıcı şekilde anlatabilmen için özel olarak hazırlanmıştır.

---

## 🗂️ BÖLÜM 1: PROJE KLASÖR YAPISI VE MİMARİSİ
*(Bu kısmı projenin kodlarını gösterirken hocaya açıklayabilirsin)*

Projemiz modern web geliştirme standartlarına uygun olarak **Frontend (Ön Yüz)** ve **Backend (Arka Yüz)** olmak üzere iki tamamen bağımsız servisten oluşmaktadır. 

### 🎨 Frontend Klasörü (`src/` - React & Tailwind CSS)
Bu klasör, kullanıcının gördüğü ve etkileşime girdiği her şeyi içerir. 
- **`src/pages/`**: Projenin tüm ekranları buradadır. Örneğin `Login.jsx` (Giriş Ekranı), `AdminPanel.jsx` (Yönetici Ekranı) gibi her sayfa kendi içinde bağımsız bir bileşen (component) olarak tasarlandı.
- **`src/components/`**: Birden fazla sayfada tekrar tekrar kullandığımız küçük tasarım parçalarıdır (örneğin butonlar, menüler, uyarı kartları). Bu sayede kod tekrarından kaçındık.
- **`src/context/AppContext.jsx`**: Uygulamanın beyni diyebiliriz. Kullanıcının giriş durumu, verilerin önbellekte tutulması (state management) gibi işlemleri merkezi olarak yönetir.
- **`src/services/api.js`**: Frontend ile Backend arasındaki köprüdür. React ekranlarımız doğrudan veritabanına bağlanmaz, bu dosyadaki fonksiyonları kullanarak FastAPI sunucusuna (Backend'e) istek atar.

### ⚙️ Backend Klasörü (`backend_py/` - Python FastAPI & PostgreSQL)
Bu klasör, güvenliğin, veri doğrulamanın ve veritabanı işlemlerinin yapıldığı yerdir.
- **`main.py`**: Sunucunun giriş kapısıdır. React'tan gelen tüm HTTP istekleri önce buraya ulaşır ve CORS (Güvenlik Politikası) kontrollerinden geçtikten sonra ilgili rotalara yönlendirilir.
- **`database.py`**: PostgreSQL (SQLAlchemy ORM) veritabanı bağlantımızın kurulduğu yerdir.
- **`models.py`**: Veritabanı hiyerarşimizin (Kullanıcılar, Sakinler, Aidatlar) Python sınıfları (Class) olarak nesne yönelimli (OOP) tasarlandığı dosyadır.
- **`schemas.py`**: Pydantic kullanarak, dışarıdan gelen verilerin (örneğin email formatının veya şifre uzunluğunun) doğruluğunu kontrol ettiğimiz güvenlik duvarımızdır.
- **`crud.py`**: Veritabanına veri ekleme, silme veya okuma gibi işlemleri SQL sorgusu yazmadan, ORM mantığıyla yaptığımız merkezdir.
- **`routes/` klasörü**: İş mantığının (Business Logic) parçalara bölündüğü klasördür. (Örn: Giriş işlemleri `auth.py`'da, aidat işlemleri `transactions.py`'da yönetilir).

---

## 🗣️ BÖLÜM 2: ADIM ADIM SUNUM SENARYOSU (KONUŞMA METNİ)

Bu kısımdaki metinleri sunum anında ekrandaki işlemleri yaparken doğrudan okuyabilir veya kendi cümlelerinle toparlayabilirsin.

### 🟢 1. Aşama: Frontend & Giriş Ekranı Sunumu (UCD Yaklaşımı)

*(Giriş ekranını aç ve şu sözlerle başla:)*

> "Hocam, projenin giriş ekranını tasarlarken **Kullanıcı Merkezli Tasarım (UCD - User-Centered Design)** prensiplerini temel aldım. Gördüğünüz gibi:
> 
> 1. **Bilişsel Yükü Azaltma:** Ekranda kullanıcıyı yoracak karmaşık detaylardan kaçındım. Şeffaf ve modern bir 'Glassmorphism' (cam efekti) kullanarak odak noktasını tamamen giriş formuna çektim.
> 2. **Hata Önleme ve Anında Geri Bildirim:** Şifre gizleme/gösterme butonu ekleyerek kullanıcının yanlış yazma ihtimalini düşürdüm. Ayrıca ekranın hemen altındaki bağlantı rozeti (Backend Bağlı) sayesinde, kullanıcının ve sistem yöneticisinin sunucu durumunu anında görebilmesini sağladım.
> 3. **Erişilebilirlik (Accessibility):** Renk kontrastlarını Tailwind CSS kullanarak özenle seçtim, böylece hem karanlık hem de aydınlık ortamlarda göz yormayan, okunabilir bir arayüz sundum. Yeni eklediğimiz 'Beni Hatırla' butonu da kullanıcı deneyimini hızlandıran bir diğer detay."

### 🔵 2. Aşama: Backend & Güvenlik Mimarisi Sunumu

*(Giriş formuna bilgileri doldur. "Giriş Yap" butonuna **basmadan hemen önce** şunu söyle:)*

> "Şimdi 'Giriş Yap' butonuna bastığımda arka planda çok katmanlı bir mimari çalışacak. İşleyişi kısaca özetlemek isterim:"

*("Giriş Yap" butonuna bas ve sayfa değişirken anlatmaya devam et:)*

> 1. "Butona tıkladığım an, Frontend'deki React uygulaması kullanıcı adı ve şifreyi alıp **JSON** formatında Python (FastAPI) sunucumuza gönderdi.
> 2. Backend tarafında bu veri önce `schemas.py` dosyasındaki Pydantic modelimizden geçerek format doğrulamasına (Validation) tabi tutuldu.
> 3. Doğrulama başarılı olunca, SQLAlchemy veritabanına bağlanıp bu kullanıcıyı buldu. Güvenlik gereği veritabanında şifreleri asla düz metin (plaintext) olarak saklamıyoruz; **bcrypt** algoritmasıyla şifrelenmiş (hashlenmiş) haliyle karşılaştırma yapılıyor.
> 4. Şifreler eşleştiği için, Python backend'imiz sadece bu oturuma özel, şifreli bir **JWT (JSON Web Token)** üretti ve React'a geri gönderdi. Şu an açılan bu yönetici paneli, işte o token'ın başarıyla doğrulanması sayesinde karşımıza geldi."

---
*Bu rehber, sunum esnasında takıldığın anlarda projeye ne kadar hakim olduğunu göstermen için harika bir kopya kağıdı olacaktır. Başarılar dilerim!*
