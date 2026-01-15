# KIOSK ve BACKEND EKİBİ İÇİN KÜMÜLATİF NOTLAR (v1.0.0)

⚠️ **ÖNEMLİ:** Bu dosya proje süresince sürekli güncellenecektir. Lütfen her dağıtım öncesi buradaki son değişiklikleri kontrol ediniz.

---

### 📅 Son Güncelleme: 16.01.2026

### 1. [KRİTİK] Geçiş Onay Mekanizması (Scan Flow Değişikliği)
**Eski Durum:** Mobil uygulama QR'ı okuduğunda kendi kendine "Başarılı" diyordu.
**Yeni Durum (Gereksinim):**
*   Mobil uygulama QR'ı okur ve kullanıcıdan onay alır.
*   Mobil uygulama aşağıdaki endpoint'e **POST** isteği atar.
*   **MOBİL UYGULAMA CEVAP GELENE KADAR BEKLER.** (Loading spinner döner).
*   Backend/Kiosk'tan gelen HTTP Status Code ve JSON cevabına göre işlem yapar.
    *   `200 OK` -> Yeşil Ekran (Geçiş Başarılı, Hoşgeldiniz).
    *   `401/403/500` -> Kırmızı Ekran (Erişim Reddedildi + Hata Mesajı).

### 2. API Endpoint Beklentisi
**URL:** `https://api.fokusistatistik.com/api/mobile/scan` (veya belirlenen BASE_URL)
**Method:** `POST`
**Mobil'den Gelen JSON:**
```json
{
  "qr_token": "...",            // Kiosk'tan okunan ham JWT
  "user_id": "12345678901",     // TC Kimlik No
  "user_name": "Ahmet Yılmaz",  // Ad Soyad
  "device_info": { ... }        // Cihaz Detayları
}
```

**Backend'den Beklenen Cevap (Başarılı):**
```json
{
  "success": true,
  "message": "Giriş Onaylandı",
  "kiosk_command": "open_gate" // Opsiyonel: Kiosk'a mesaj iletildiğini doğrular
}
```

**Backend'den Beklenen Cevap (Hata):**
```json
{
  "success": false,
  "message": "Yetkisiz Giriş Denemesi / Bakliye Yetersiz / Yanlış Kapı"
}
```

### 3. Kiosk Ekranı (Frontend) Aksiyonu
*   Backend, Mobil'den gelen başarılı isteği doğruladığında, Socket veya Polling üzerinden ilgili Kiosk ID'sine (QR içindeki `kid`) bir sinyal göndermelidir.
*   Kiosk ekranında **"Hoşgeldiniz, Sayın Ahmet Yılmaz"** yazısı belirmelidir.
*   Mobil uygulama sadece "İşlem Başarılı" ekranı gösterir, kapıyı açan ve karşılayan Kiosk'tur.
