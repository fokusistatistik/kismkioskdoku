# DOKU Mobil - Backend Bağlantı Rehberi

## 🔧 Geliştirme Ortamı Kurulumu

### 1. Backend Hazırlığı
Backend sunucunuz `http://localhost:3000` adresinde çalışıyor olmalı.

### 2. Mobil Uygulama Yapılandırması

#### A. Yerel Test (Aynı Bilgisayarda)
Eğer mobil uygulamayı bilgisayarınızın tarayıcısında test ediyorsanız:

```bash
# .env.local dosyası oluşturun
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### B. Telefonda Test (Gerçek Cihaz)
Telefon localhost'a erişemez, bilgisayarınızın yerel IP'sini kullanmalısınız:

**Adımlar:**
1. Bilgisayarınızın IP adresini öğrenin:
   - Windows: `ipconfig` → "IPv4 Address" (örn: 192.168.1.5)
   - Mac/Linux: `ifconfig` → "inet" (örn: 192.168.1.5)

2. `.env.local` dosyasını düzenleyin:
```bash
NEXT_PUBLIC_API_URL=http://192.168.1.5:3000
```

3. Telefon ve bilgisayar **aynı WiFi ağında** olmalı

4. Uygulamayı yeniden başlatın:
```bash
npm run dev
```

### 3. API Endpoint Testi

**Test Komutu (PowerShell):**
```powershell
$body = @{
    qr_token = "test-token"
    user_id = "17422776208"
    user_name = "Test User"
    device_info = @{
        uuid = "test-device"
        user_agent = "Test"
        platform = "Test"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/mobile/scan" -Method POST -Body $body -ContentType "application/json"
```

**Beklenen Başarılı Yanıt:**
```json
{
  "success": true,
  "message": "Giriş Onaylandı",
  "kiosk_command": "open_gate"
}
```

### 4. Sorun Giderme

#### "Failed to Fetch" Hatası
- ✅ Backend çalışıyor mu? (`http://localhost:3000` tarayıcıda açılıyor mu?)
- ✅ `.env.local` dosyası doğru IP'yi gösteriyor mu?
- ✅ Telefon ve bilgisayar aynı ağda mı?
- ✅ Firewall backend portunu (3000) engelliyor mu?

#### CORS Hatası
Backend'de CORS zaten açık, ancak şüpheleniyorsanız:
```javascript
// Backend'de kontrol edin
app.use(cors({ origin: '*' }));
```

#### Mock Mode'dan Çıkamıyorum
`.env.local` dosyası varsa ve `NEXT_PUBLIC_API_URL` tanımlıysa mock mode devre dışı kalır.
Console'da şu mesajı görmelisiniz:
```
📡 Sending Request to: http://192.168.1.5:3000/api/mobile/scan
```

### 5. Production Deployment

Canlıya alırken `.env.local` dosyasını şöyle güncelleyin:
```bash
NEXT_PUBLIC_API_URL=https://api.fokusistatistik.com
```

Deploy scriptinde bu otomatik olarak ayarlanacak.

---

## 📱 Test Kullanıcıları
- **TC:** 17422776208 (Şifre: 1742)
- **TC:** 24400543608 (Şifre: 2440)

## 🔗 Endpoint Özeti
- **Scan:** `POST /api/mobile/scan`
- **Timeout:** 10 saniye
- **CORS:** Aktif (Tüm originler)

---

> **Son Güncelleme:** 16.01.2026 00:06
