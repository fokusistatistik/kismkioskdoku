# DOKU - Dijital Otomasyon Kontrol Uygulaması
## Teknik Şartname ve Sistem Mimarisi (v1.1.0)

### 1. Proje Özeti
DOKU, tesis ve birimlerdeki fiziksel erişim kontrolünü dijitalleştirmek amacıyla geliştirilmiş, **Next.js** tabanlı bir **Mobil PWA (Progressive Web App)** uygulamasıdır. Kiosk cihazları üzerinden üretilen dinamik karekodları (QR) tarayarak personelin ve yetkili kişilerin güvenli geçiş yapmasını sağlar.

---

### 2. Teknoloji Yığını (Tech Stack)

*   **Framework:** Next.js 16 (App Router)
*   **Dil:** TypeScript
*   **Stil:** Tailwind CSS v3 (Premium Dark Mode & Glassmorphism)
*   **PWA Altyapısı:** `@ducanh2912/next-pwa`
    *   Offline Çalışma Desteği
    *   Standalone (Uygulama) Modu
    *   Install Prompt (Kurulum Zorlama)
*   **QR Tarama:** `html5-qrcode` (Kamera erişimi ve optimizasyon)
*   **Veri İşleme:** `jwt-decode` Client-side decoding)
*   **Animasyon:** `framer-motion`
*   **Sunucu/Deploy:** Ubuntu, Nginx, PM2 (Port 3010)

---

### 3. Temel Özellikler ve İş Akışları

#### 3.1. Cihaz Kaydı ve Oturum Açma (Device Binding)
*   **Yöntem:** Kullanıcı **TC Kimlik Numarası** ve **Ad Soyad** girerek sisteme dahil olur.
*   **Güvenlik (Device Locking):**
    *   İlk girişte girilen TC numarası, tarayıcının yerel hafızasına (`localStorage`) cihaz sahibi olarak kaydedilir (`device_owner_tc`).
    *   Uygulama silinmediği veya sıfırlanmadığı sürece, bu cihazdan **başka bir TC ile giriş yapılamaz**.
    *   Çıkış Yap (Logout) butonu sistemden kaldırılmıştır; bu sayede saha personeli oturumu yanlışlıkla kapatamaz.

#### 3.2. Dashboard (Ana Ekran)
*   Kullanıcıyı "Sn. [Ad Soyad]" mesajı ile karşılar.
*   Merkezi ve büyük bir **"QR TARA"** butonu içerir.
*   Son geçiş yapılan noktaların kısa bir özetini (Örn: Ana Kapı - 08:30) listeler.

#### 3.3. QR Tarama ve Geçiş (Scan Flow)
1.  Kullanıcı "QR TARA" butonuna basar.
2.  Arka kamera (Environment Facing) otomatik olarak açılır.
3.  Ekranda görsel bir hizalama çerçevesi ve yönerge belirir.
4.  Kiosk ekranındaki QR kod algılandığında:
    *   Uygulama "QR Okundu" mesajı verir.
    *   Tarama arka planda duraklatılır (Siyah ekran oluşmaması için son kare tutulur veya duraklatılır).
    *   Onay ekranı açılır.
5.  Onay verildiğinde mobil cihaz, Kiosk sistemine kişinin Ad, Soyad ve TC bilgilerini iletir.

---

### 4. PWA ve Kiosk Uyumluluğu

#### 4.1. Kurulum Zorlama (Install Enforcement)
*   Uygulama web tarayıcısında (Chrome/Safari) açıldığında, **"InstallPrompt"** bileşeni devreye girer ve ekranı kilitler.
*   Kullanıcı uygulamayı yükleyip oradan açtığında bu engel kalkar ve tam ekran deneyimi başlar.

#### 4.2. Standalone Mod
*   Tarayıcı adres çubuğu, geri/ileri butonları gizlenir.
*   Uygulama, yerel bir mobil uygulama (Native App) hissi verir.

---

### 5. Dağıtım (Deployment) Süreci

Sistem, `deploy_doku.sh` scripti ile otomatize edilmiştir. Bu script:
1.  Eski `3010` portunu ve dosyaları temizler.
2.  GitHub üzerinden en güncel `feature/pwa-kiosk-update` kodunu çeker.
3.  Gerekli ortam değişkenlerini (`.env.local`) ayarlar.
4.  PWA önbelleklerini temizler ve Production Build alır.
5.  PM2 üzerinden servisi başlatır ve Nginx ayarlarını günceller.

**Canlı URL:** `https://doku.fokusistatistik.com`
