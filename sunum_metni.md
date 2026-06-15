# 🎙️ HBT-main: Dijital Yönetim Sistemi - Kapsamlı Sunum Senaryosu

Bu belge, projeyi jüriye veya hocalara sunarken kullanacağınız **kapsamlı ve detaylı** metindir. "Bu proje ne işe yarar?", "Hangi platformda çalıştırılır?" gibi soruların cevaplarını barındırır.

---

## 📌 0. Hazırlık: Projeyi Nerede ve Nasıl Açmalısınız?

**Soru:** *Bu projeyi nerede açalım?*
**Cevap:** Projenin kodlarını kesinlikle **Visual Studio Code (VS Code)** üzerinde açmalısınız. VS Code, hem Frontend (React) hem de Backend (Python) kodlarını aynı anda düzenleyebilmenizi ve kendi içindeki terminali sayesinde projeyi kolayca başlatabilmenizi sağlar.

**Sunum Öncesi Yapmanız Gerekenler:**
1. Proje klasörünü (`HBT-main`) **VS Code** ile açın.
2. **Backend'i Başlatmak:** Proje ana klasöründeki `BACKEND_PY_BASLAT.bat` dosyasına çift tıklayın (Bu arka planda siyah bir ekranda çalışmaya devam etmelidir).
3. **Frontend'i Başlatmak:** VS Code içerisinde üst menüden `Terminal > New Terminal` (Yeni Terminal) açın ve şu komutu yazıp Enter'a basın: `npm run dev`
4. Tarayıcınızda (Google Chrome vb.) `http://localhost:5173` adresine giderek sistemi hazırda bekletin.
5. Sunum sırasında tarayıcı pencereniz ile VS Code pencereniz arasında geçiş (Alt+Tab) yapacak şekilde ekranınızı hazırlayın.

---

## 🎬 1. BÖLÜM: Giriş, Proje Amacı ve Kullanım Alanları

> [!TIP]
> **Ekranda Gösterilecek:** Tarayıcıda sistemin `Giriş Yap` (Login) ekranı açık olsun. Hocalar arayüzün şıklığını görsün.

**Söylenecekler:**
"Değerli hocalarım, değerli jüri üyeleri, merhaba.
Bugün sizlere geliştirdiğimiz **Dijital Yönetim Sistemi** projemizi sunmaktan mutluluk duyuyorum. 

Bildiğiniz üzere, günümüzde konut yönetimleri hala WhatsApp grupları, Excel tabloları veya apartman panolarına asılan kağıtlarla yürütülüyor. Bu durum aidat takibini zorlaştırıyor, şikayetlerin kaybolmasına neden oluyor ve şeffaflığı ortadan kaldırıyor. Biz bu problemi çözmek için modern, güvenli ve tam kapsamlı bir web uygulaması geliştirdik.

**Bu Proje Nerelerde Kullanılabilir?**
Projemiz oldukça esnek bir yapıya sahip. Temel olarak:
1. **Apartmanlar ve Siteler:** Yöneticilerin aidat toplaması, sakinlerin havuz/spor salonu rezervasyonu yapması için,
2. **Öğrenci Yurtları:** Öğrencilerin arıza/talep bildirmesi (örneğin "odamın lambası bozuk") ve yönetimin duyuru yapması için,
3. **İş Merkezleri ve Plazalar:** Ofislerin aidat giderlerini ve ortak toplantı odalarının rezervasyonlarını yönetmek için rahatlıkla kullanılabilir.

Uygulamamız bir **Full-Stack** projesidir. İstemci tarafında **React**, sunucu tarafında ise Python'un modern framework'ü **FastAPI** kullanılmıştır."

---

## 👑 2. BÖLÜM: Yönetici Paneli (Sistemin Yönetimi)

> [!TIP]
> **Ekranda Gösterilecek:** Tarayıcıdan bir "Yönetici" kullanıcı adı ve şifresiyle sisteme giriş yapın.

**Söylenecekler:**
"Sisteme ilk olarak bir **Yönetici** hesabıyla giriş yapıyorum. Karşımıza çıkan bu Ana Gösterge Paneli (Dashboard), yöneticinin sitenin röntgenini çektiği yerdir. Kasa durumu, tahsil edilen aidatlar ve bekleyen talepler tek ekranda özetlenir."

> [!TIP]
> **Ekranda Gösterilecek:** Sol menüden sırasıyla **Sakin Listesi** ve **Finansal Dashboard**'a tıklayın.

**Söylenecekler:**
"**Sakin Listesi** modülünde, binadaki tüm dairelerin kayıtları tutulur. Yönetici buradan sisteme yeni bir kiracı ekleyebilir veya toplu aidat borçlandırması yapabilir. 
**Finansal Dashboard** ise sitenin muhasebesidir. Toplanan aidatlar otomatik olarak gelire yazılırken, yönetici buradan 'Asansör Bakımı', 'Temizlik Gideri' gibi harcamaları sisteme işleyerek kasanın şeffaf kalmasını sağlar. Excel karmaşasına son verdik."

---

## 👨‍👩‍👧‍👦 3. BÖLÜM: Sakin Paneli (Kullanıcı Deneyimi)

> [!TIP]
> **Ekranda Gösterilecek:** Sağ üstten çıkış yapıp, bu kez bir "Bina Sakini" olarak giriş yapın.

**Söylenecekler:**
"Şimdi sistemden çıkış yapıp, sıradan bir apartman sakini olarak giriş yapıyorum. Gördüğünüz gibi, sistem rol tabanlı (Role-based) çalışıyor ve arayüz tamamen değişti. Sakin sadece kendini ilgilendiren bilgileri görüyor."

> [!TIP]
> **Ekranda Gösterilecek:** Sol menüden **Talepler** ve **Hizmetler (Rezervasyon)** sekmelerini tıklayın.

**Söylenecekler:**
"Bir bina sakini bu panel üzerinden;
* Kendi aidat borcunu anlık olarak görüntüleyebilir,
* Yöneticinin yayınladığı su kesintisi, toplantı gibi önemli **Duyuruları** okuyabilir,
* Asansör bozulduğunda veya kapıcıya ihtiyacı olduğunda **Talep** (Ticket) oluşturup, bu talebin çözülüp çözülmediğini takip edebilir,
* Ve eğer sitede havuz, spor salonu, tenis kortu gibi ortak alanlar varsa, **Hizmetler** sekmesinden dijital olarak saatlik rezervasyon yapabilir."

---

## 💻 4. BÖLÜM: VS Code Üzerinden Kod ve Mimari Gösterimi (Teknik Detaylar)

> [!IMPORTANT]
> **Ekranda Gösterilecek:** Tarayıcıyı alta alın ve projeyi açtığınız **Visual Studio Code (VS Code)** ekranını yansıtın. Sol taraftaki klasör ağacı açık olsun.

**Söylenecekler:**
"Projemizin kod yapısına gelecek olursak, kodları **Visual Studio Code** üzerinde yazıp test ettik. Karmaşayı önlemek için projemizi iki ana klasöre ayırdık:

1. **Frontend (Ön Yüz) Mimarisini Göstereyim:** *(VS Code sol menüden `src` klasörünü ve `App.jsx` dosyasını açın)*
Ön yüzü **React** ve **Vite** altyapısıyla geliştirdik. React'ın 'Component' (Bileşen) mimarisi sayesinde kod tekrarının önüne geçtik. Tasarımların modern ve mobil uyumlu (responsive) olması için standart CSS yerine **TailwindCSS** kullandık. `App.jsx` dosyamızda görebileceğiniz gibi, React Router kullanarak yönetici ve sakinlerin izinsiz sayfalara girmesini engelleyen Korumalı Rotalar (Protected Routes) yazdık.

2. **Backend (Arka Yüz) Mimarisini Göstereyim:** *(VS Code sol menüden `backend_py` klasörünü açın. Ardından `main.py` ve `models.py` dosyalarına tıklayın)*
Arka planda **Python** ve oldukça hızlı bir kütüphane olan **FastAPI** kullandık. Node.js yerine Python tercih etmemizin sebebi, sistemin ileride yapay zeka veya veri analizi özelliklerine daha kolay entegre olabilmesidir. 
*(`models.py` dosyasını göstererek)* Veritabanı yönetimini güvenli hale getirmek için doğrudan SQL sorguları yazmak yerine **SQLAlchemy ORM** kullandık. Gördüğünüz bu sınıflar, veritabanımızdaki tabloların ta kendisidir. Veritabanı motoru olarak SQLite/PostgreSQL kullanıyoruz."

---

## 🏁 5. BÖLÜM: Kapanış

**Söylenecekler:**
"Özetle bu proje; dağınık yönetim süreçlerini merkezi bir dijital platformda toplayan, şeffaf, güvenilir ve modern teknolojilerle inşa edilmiş uçtan uca (End-to-End) bir çözümdür.
Beni dinlediğiniz için teşekkür ederim. Sistemin herhangi bir yerini uygulamalı olarak göstermemi isterseniz veya kod yapısıyla ilgili sorularınız varsa yanıtlamaktan memnuniyet duyarım."
