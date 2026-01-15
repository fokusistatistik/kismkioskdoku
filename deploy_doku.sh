# ==========================================
# 🚀 DOKU SİSTEMİ - CLEAN ESTABLISHMENT (v1.0.0)
# ==========================================
# Branch: feature/pwa-kiosk-update
# Port: 3010
# Özellik: Auto PWA Reset + Kiosk Mode + Smart Install

set -e

echo "🛑 [1/10] Eski Sistem ve Portlar Temizleniyor..."
pm2 delete doku 2>/dev/null || true
# Port 3010'u işgal eden her şeyi durdur
sudo fuser -k 3010/tcp 2>/dev/null || true

echo "🧹 [2/10] Dosya Temizliği..."
sudo rm -rf /var/www/doku.fokusistatistik.com

if [ -d "/var/www/doku.fokusistatistik.com" ]; then
    echo "❌ HATA: Dosyalar silinemedi! İzin problemi."
    exit 1
fi

echo "📂 [3/10] Dizin Oluşturuluyor..."
sudo mkdir -p /var/www/doku.fokusistatistik.com
sudo chown -R $USER:$USER /var/www/doku.fokusistatistik.com
cd /var/www/doku.fokusistatistik.com

echo "⬇️ [4/10] Codebase İndiriliyor (Branch: feature/pwa-kiosk-update)..."
git clone -b feature/pwa-kiosk-update https://github.com/fokusistatistik/kismkioskdoku.git .

echo "⚙️ [5/10] Konfigürasyon (.env.local) Hazırlanıyor..."
cat > .env.local << 'EOF'
NODE_ENV=production
PORT=3010

# Main URLs
NEXT_PUBLIC_APP_URL=https://doku.fokusistatistik.com
EOF

echo "📦 [6/10] Paket Kurulumu..."
npm install

echo "🧹 [7/10] PWA Cache Temizliği (ÖNEMLİ)..."
# Git'ten gelmiş olabilecek eski cache dosyalarını sil, build tazesini üretsin.
rm -f public/sw.js public/workbox-*.js
echo "   -> Eski Service Worker dosyaları temizlendi."

echo "🏗️ [8/10] Build (v1.0.0)..."
rm -rf .next
NEXT_LINT_IGNORE=true NODE_ENV=production npm run build

echo "🚀 [9/10] Başlatılıyor..."
PORT=3010 pm2 start npm --name "doku" -- start -- -p 3010
pm2 save

echo "🔧 [10/10] NGINX Port Ayarı (3010) Kontrol Ediliyor..."
NGINX_CONF="/etc/nginx/sites-enabled/doku.fokusistatistik.com"

if [ -f "$NGINX_CONF" ]; then
    echo "   -> Nginx ayar dosyası işleniyor..."
    sudo sed -i 's/localhost:3000/localhost:3010/g' "$NGINX_CONF"
    sudo sed -i 's/127.0.0.1:3000/127.0.0.1:3010/g' "$NGINX_CONF"
    
    if sudo nginx -t; then
        sudo systemctl reload nginx
        echo "   ✅ Nginx senkronizasyonu tamam."
    else
        echo "   ❌ Nginx yapılandırma hatası! Manuel kontrol gerekebilir."
    fi
else
    echo "   ⚠️ Nginx dosyası bulunamadı, geçiliyor."
fi

echo "⏳ Sistem oturuyor, lütfen 5 saniye bekleyin..."
sleep 5

echo ""
echo "#############################################"
echo "🔍 FİNAL KONTROLLER (v1.0.0)"
echo "#############################################"

echo "1. [VERSİYON KONTROLÜ] Yüklü Olan Son Commit:"
git log -1 --format="%C(green)%h%Creset - %s (%cd)" --date=local

echo ""
echo "2. [PM2 DURUMU] Uptime (Süre Artıyor mu?):"
pm2 list | grep "doku"

echo ""
echo "3. [BAŞLANGIÇ LOGLARI] Hata Yok, 'Ready' Var mı?:"
pm2 logs doku --lines 20 --nostream

echo ""
echo "#############################################"
echo "✅ KURULUM BAŞARILI! Tarayıcı önbelleğini temizleyip (Gizli Sekme) giriniz."
echo "👉 https://doku.fokusistatistik.com"
