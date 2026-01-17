# 🚀 KIOSK Uygulaması - Deployment Talimatları

## 📦 Paket İçeriği

`kiosk-deploy.zip` dosyası aşağıdaki dosya ve klasörleri içermektedir:

- ✅ `.next` - Build çıktıları (Production)
- ✅ `public` - Statik dosyalar (resimler, PWA manifestleri, vb.)
- ✅ `package.json` - Proje bağımlılıkları
- ✅ `package-lock.json` - Bağımlılık kilidi
- ✅ `next.config.ts` - Next.js yapılandırması
- ✅ `.env.local` - Production ortam değişkenleri
- ✅ `postcss.config.js` - PostCSS yapılandırması
- ✅ `tailwind.config.js` - Tailwind CSS yapılandırması
- ✅ `tsconfig.json` - TypeScript yapılandırması
- ✅ `next-env.d.ts` - Next.js tip tanımları

## 🔧 Sunucuda Kurulum Adımları

### 1. Paketi Sunucuya Yükleme

```bash
# Zip dosyasını sunucuya yükleyin (FTP, SCP, vb.)
# Örnek: scp kiosk-deploy.zip user@server:/path/to/kiosk/
```

### 2. Paketi Açma

```bash
# Sunucuda proje dizinine gidin
cd /path/to/kiosk/

# Zip dosyasını açın
unzip kiosk-deploy.zip

# veya tar kullanıyorsanız:
# tar -xzf kiosk-deploy.tar.gz
```

### 3. Node Modüllerini Kurma

```bash
# Production bağımlılıklarını kurun (node_modules pakette YOK)
npm ci --production

# veya
npm install --production
```

### 4. Ortam Değişkenlerini Kontrol Etme

`.env.local` dosyasının içeriğini kontrol edin:

```bash
cat .env.local
```

Beklenen içerik:
```
NODE_ENV=production
PORT=3010

NEXT_PUBLIC_API_URL=https://doku.fokusistatistik.com
NEXT_PUBLIC_SOCKET_URL=https://doku.fokusistatistik.com
NEXT_PUBLIC_APP_URL=https://kiosk.fokusistatistik.com
```

### 5. Uygulamayı Başlatma

#### PM2 ile (Önerilen):

```bash
# PM2 kurulu değilse:
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "kiosk-app" -- start

# Otomatik başlatmayı etkinleştirin
pm2 startup
pm2 save
```

#### Systemd ile:

```bash
# /etc/systemd/system/kiosk.service dosyası oluşturun
sudo nano /etc/systemd/system/kiosk.service
```

İçerik:
```ini
[Unit]
Description=DOKU Kiosk Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/kiosk
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3010

[Install]
WantedBy=multi-user.target
```

Servisi başlatın:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kiosk
sudo systemctl start kiosk
sudo systemctl status kiosk
```

#### Manuel Başlatma:

```bash
# Port 3010'da başlatın
npm start

# veya custom port ile:
PORT=3010 npm start
```

### 6. Nginx Reverse Proxy Yapılandırması (Opsiyonel)

```nginx
server {
    listen 80;
    server_name kiosk.fokusistatistik.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ✅ Doğrulama

Uygulamanın çalıştığını doğrulamak için:

```bash
# Port kontrolü
netstat -tulpn | grep 3010

# veya
lsof -i :3010

# HTTP isteği ile test
curl http://localhost:3010

# PM2 ile çalışıyorsa:
pm2 status
pm2 logs kiosk-app
```

## 🔄 Güncelleme Süreci

Yeni bir versiyon deploy etmek için:

```bash
# Uygulamayı durdurun
pm2 stop kiosk-app

# Eski .next klasörünü yedekleyin
mv .next .next.backup

# Yeni zip'i açın
unzip -o kiosk-deploy-new.zip

# Bağımlılıkları güncelleyin (gerekirse)
npm ci --production

# Uygulamayı yeniden başlatın
pm2 restart kiosk-app
```

## 🐛 Sorun Giderme

### Port zaten kullanımda hatası:
```bash
# Port'u kullanan process'i bulun
lsof -i :3010

# Process'i sonlandırın
kill -9 <PID>
```

### Ortam değişkenleri yüklenmiyor:
```bash
# .env.local dosyasının varlığını kontrol edin
ls -la | grep .env

# İçeriğini kontrol edin
cat .env.local
```

### Build dosyaları bulunamıyor:
```bash
# .next klasörünün varlığını kontrol edin
ls -la .next/

# Gerekirse yeniden build alın (sunucuda)
npm run build
```

## 📞 Destek

Sorun yaşarsanız lütfen aşağıdaki bilgileri iletin:

- PM2 logları: `pm2 logs kiosk-app --lines 100`
- Sistem logları: `journalctl -u kiosk -n 100`
- Ortam değişkenleri: `cat .env.local`
- Node versiyonu: `node --version`
- NPM versiyonu: `npm --version`

---

**Build Tarihi:** 2026-01-16  
**Build Ortamı:** Windows (Local)  
**Node Version:** v20.x  
**Next.js Version:** 16.1.2
