# BACKEND/KIOSK EKİBİNE NOTLAR (Kümülatif)

Bu dosya, Backend ve Kiosk ekiplerine iletilmesi gereken teknik gereksinimleri içerir.

---

## � REVİZYON 1.1 - 16.01.2026

### 1. [KRİTİK] Geçiş Onay Mekanizması
**Durum:** ✅ Tamamlandı
- Mobil uygulama artık backend'den 200 OK gelmeden "Başarılı" demiyor.
- Loading spinner backend cevabını bekliyor.

### 2. API Endpoint Gereksinimleri
**URL:** `https://api.fokusistatistik.com/api/mobile/scan`
**Method:** POST
**Timeout:** 10 saniye

**Gönderilen Payload:**
```json
{
  "qr_token": "...",
  "user_id": "12345678901",
  "user_name": "Ahmet Yılmaz",
  "device_info": {
    "uuid": "12345678901",
    "user_agent": "Mozilla/5.0...",
    "platform": "iPhone",
    "timestamp": "2026-01-16T00:00:00.000Z"
  }
}
```

**Beklenen Cevaplar:**
- `200 OK` → Mobil: Yeşil Ekran + Dashboard'a yönlendir
- `404 Not Found` → Mobil: "Kayıt Bulunamadı"
- `403 Forbidden` → Mobil: "Cihaz Eşleşmiyor"
- `400 Bad Request` → Mobil: "QR Zaman Aşımı"

### 3. Kiosk Ekranı Aksiyonu
Backend, başarılı isteği doğruladığında:
1. İlgili Kiosk ID'sine (`kid`) Socket/Polling ile sinyal gönder
2. Kiosk ekranında **"Hoşgeldiniz, Sayın [user_name]"** göster
3. Kapıyı/turnikeyi aç

### 4. Geliştirme Modu (Development)
**Not:** Backend hazır olmadığında mobil uygulama otomatik olarak MOCK mode'a geçer.
- `NODE_ENV=development` ise → Mock yanıt döner
- `NEXT_PUBLIC_API_URL` tanımlı değilse → Mock yanıt döner
- Production'da bu otomatik devre dışı kalır.

### 5. Cihaz Sıfırlama (Admin Reset)
**Yeni Özellik:** Yanlış TC ile kayıt yapıldığında admin şifresi (0000) ile cihaz sıfırlanabilir.
- Login ekranında hata mesajı altında "Cihazı Sıfırla" linki var
- Admin PIN: `0000` (Değiştirilebilir)
- Tüm localStorage temizlenir, yeni kurulum yapılabilir

---

## ⚠️ BACKEND EKİBİNE HATIRLATMA
1. API endpoint'i hazır olana kadar mobil uygulama mock mode'da çalışacak
2. CORS ayarlarını kontrol edin (doku.fokusistatistik.com'dan gelen isteklere izin)
3. Response süresi 10 saniyeyi geçmemeli
4. Socket/WebSocket için Kiosk ID mapping'i hazır olmalı
