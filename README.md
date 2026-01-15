# DOKU Mobil PWA - README

## 📱 Proje Hakkında
DOKU (Dijital Otomasyon Kontrol Uygulaması), tesis erişim kontrolü için geliştirilmiş bir Progressive Web App (PWA) uygulamasıdır. Kiosk cihazlarından okutulan QR kodları ile personel geçiş kontrolü sağlar.

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
npm start
```

### Ortam Değişkenleri
`.env.local` dosyası oluşturun:

```bash
# Backend API URL (Geliştirme için yerel IP kullanın)
NEXT_PUBLIC_API_URL=http://192.168.1.5:3000

# Uygulama URL
NEXT_PUBLIC_APP_URL=https://doku.fokusistatistik.com
```

**Not:** Telefonda test için `localhost` yerine bilgisayarınızın yerel IP adresini kullanın.

## 📚 Dokümantasyon
- [Teknik Şartname](docs/DOKU_TEKNIK_SARTNAME.md)
- [Kiosk Entegrasyon Rehberi](docs/KIOSK_ENTEGRASYON_REHBERI.md)
- [Backend Bağlantı Rehberi](docs/BACKEND_BAGLANTI_REHBERI.md)
- [Kiosk Ekibine Notlar](docs/KIOSK_UYGULAMASINA_NOTLAR.md)

## 🔧 Özellikler
- ✅ PWA Desteği (Offline çalışma)
- ✅ Cihaz Kilitleme (TC bazlı)
- ✅ QR Kod Tarama
- ✅ Gerçek Zamanlı Backend İletişimi
- ✅ Admin Reset (PIN: 0000)
- ✅ Responsive Tasarım
- ✅ Dark Mode

## 🏗️ Teknoloji Yığını
- **Framework:** Next.js 16 (App Router)
- **Dil:** TypeScript
- **Stil:** Tailwind CSS v3
- **PWA:** @ducanh2912/next-pwa
- **QR Tarama:** html5-qrcode
- **Animasyon:** Framer Motion

## 📦 Deployment

### Sunucuya Yükleme
```bash
# Deploy scriptini çalıştır
chmod +x deploy_doku.sh
./deploy_doku.sh
```

Script otomatik olarak:
1. Eski sürümü temizler
2. GitHub'dan son kodu çeker
3. Bağımlılıkları yükler
4. Production build alır
5. PM2 ile başlatır
6. Nginx ayarlarını günceller

### Manuel Deployment
```bash
# Build
npm run build

# PM2 ile başlat
pm2 start npm --name "doku" -- start -- -p 3010
pm2 save
```

## 🧪 Test Kullanıcıları
- **TC:** 17422776208 (Şifre: 1742)
- **TC:** 24400543608 (Şifre: 2440)

## 🔐 Güvenlik
- Cihaz başına tek kullanıcı (Device Binding)
- Admin PIN korumalı reset (0000)
- HTTPS zorunlu (PWA gereksinimi)
- JWT tabanlı QR doğrulama

## 📝 Lisans
Fokus İstatistik © 2026

## 🤝 Katkıda Bulunma
Bu proje Fokus İstatistik için özel olarak geliştirilmiştir.

---

**Canlı URL:** https://doku.fokusistatistik.com
**Port:** 3010
**Branch:** feature/pwa-kiosk-update
