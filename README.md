# HBT-main Projesi

Bu proje React (Frontend) ve FastAPI (Python Backend) kullanılarak geliştirilmiştir.

## Projeyi Bilgisayara İndirme ve Kurma (Takım Arkadaşları İçin)

### 1. Projeyi İndirin
Projeyi GitHub üzerinden yeşil `Code` butonuna basıp klonlayabilir veya indirebilirsiniz. Terminal kullanarak indirmek için:
```bash
git clone https://github.com/Hillkurt/HBT-main.git
```

### 2. Ortam Değişkenleri ve Veritabanı (.env Kurulumu)
Güvenlik nedeniyle veritabanı şifreleri GitHub'a yüklenmez. Backend'in çalışabilmesi için şu adımları izleyin:
1. Proje klasöründeki `backend_py` klasörünün içine girin.
2. Orada bulunan `.env.example` dosyasının adını sağ tıklayıp yeniden adlandır diyerek sadece `.env` olarak değiştirin.
3. Proje sahibinden (Hilal) güvenli bir kanaldan aldığınız `DATABASE_URL` linkini kopyalayıp bu `.env` dosyasının içine yapıştırın ve kaydedin.

### 3. Backend'i Başlatma (Python)
Ana klasörde bulunan **`BACKEND_PY_BASLAT.bat`** dosyasına çift tıklamanız yeterlidir. Bu dosya otomatik olarak gerekli kütüphaneleri kuracak ve sunucuyu başlatacaktır. *(Not: Bilgisayarınızda Python yüklü olmalıdır).*

### 4. Frontend'i Başlatma (React)
VS Code içerisinde yeni bir terminal açıp projenin ana klasöründe şu komutları sırasıyla çalıştırın:
```bash
# Sadece ilk kurulumda çalıştırılır
npm install

# Projeyi başlatmak için çalıştırılır
npm run dev
```
