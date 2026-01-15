# 🔧 DOKU Deployment - Hızlı Düzeltme Rehberi

## ❌ Hata: "API URL yapılandırılmamış"

### Sebep
`.env.local` dosyasında `NEXT_PUBLIC_API_URL` eksik veya yanlış.

### Çözüm

#### 1. Backend'in Konumunu Belirleyin

**Senaryo A: Backend aynı sunucuda (localhost)**
```bash
# Backend port 3000'de çalışıyorsa
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Senaryo B: Backend farklı bir portta**
```bash
# Örneğin backend 8080'deyse
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Senaryo C: Backend farklı bir sunucuda**
```bash
# Backend başka bir sunucudaysa
NEXT_PUBLIC_API_URL=https://api.fokusistatistik.com
```

#### 2. Deploy Scriptini Güncelleyin

`deploy_doku.sh` dosyasında `.env.local` bölümünü düzenleyin:

```bash
cat > .env.local << 'EOF'
NODE_ENV=production
PORT=3010

# API Configuration - Backend'in gerçek adresi
NEXT_PUBLIC_API_URL=http://localhost:3000  # ← BURASI ÖNEMLİ

# App URL
NEXT_PUBLIC_APP_URL=https://doku.fokusistatistik.com
EOF
```

#### 3. Manuel Düzeltme (Acil Durum)

Eğer deploy script çalıştırdıysanız ve hata alıyorsanız:

```bash
# Sunucuya bağlanın
cd /var/www/doku.fokusistatistik.com

# .env.local dosyasını düzenleyin
nano .env.local

# Şu satırı ekleyin/düzeltin:
NEXT_PUBLIC_API_URL=http://localhost:3000

# Kaydet ve çık (Ctrl+X, Y, Enter)

# Uygulamayı yeniden başlatın
pm2 restart doku

# Logları kontrol edin
pm2 logs doku --lines 50
```

#### 4. Backend Port Kontrolü

Backend'in hangi portta çalıştığını öğrenin:

```bash
# PM2 ile çalışıyorsa
pm2 list

# Port dinleme kontrolü
sudo netstat -tulpn | grep LISTEN

# Örnek çıktı:
# tcp  0  0  0.0.0.0:3000  0.0.0.0:*  LISTEN  12345/node
#                 ^^^^
#              Backend portu
```

### Test

Deploy sonrası tarayıcı console'unda şunu görmelisiniz:

```
📡 Sending Request to: http://localhost:3000/api/mobile/scan
```

Eğer hala "API URL yapılandırılmamış" hatası alıyorsanız:

1. `.env.local` dosyasının varlığını kontrol edin
2. `NEXT_PUBLIC_API_URL` satırının doğru olduğundan emin olun
3. PM2'yi restart edin: `pm2 restart doku`

---

> **Not:** `NEXT_PUBLIC_` prefix'i Next.js için zorunludur. Bu olmadan environment variable client-side'da görünmez!
