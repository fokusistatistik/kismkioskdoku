# BACKEND/KIOSK EKİBİNDEN GELEN REVİZYONLAR (Gelen Kutusu)

Bu dosya, Backend ve Kiosk ekiplerinden DOKU Mobil (PWA) ekibine iletilen teknik gereksinimleri ve uyarıları içerir.

---

## Revizyon: 1.0 - 15.01.2026

### 1. Backend Onayı (Kritik)
**Talep:** DOKU Mobil uygulaması, QR kodu okuttuktan sonra sunucudan yanıt gelmeden ASLA "Geçiş Onaylandı" ekranı göstermemelidir.
**Durum:** ✅ **Uygulandı.** (Scan sayfasındaki mock "Successful" mantığı kaldırıldı, `fetch` cevabı 200 dönmeden yeşil ekran açılmıyor.)

### 2. Status Kodları ve UI Davranışı
**Talep:** HTTP yanıt kodlarına göre özel mesajlar gösterilmeli.
- **200 OK:** Yeşil Ekran ("Giriş Başarılı").
- **404 Not Found:** Kırmızı Ekran ("Kayıt Bulunamadı").
- **403 Forbidden:** Turuncu/Kırmızı Uyarı ("Cihaz Eşleşmiyor").
- **400 Bad Request:** Sarı Uyarı ("QR Zaman Aşımı").
**Durum:** ✅ **Uygulandı.** (Hata yönetimi switch-case yapısı ile güncellendi.)

### 3. Payload Yapısı
`/api/mobile/scan` endpointi için teyit edilen JSON yapısı:
```json
{
  "qr_token": "...",
  "user_id": "...",    // TC
  "user_name": "...",  // Ad Soyad
  "device_info": { "uuid": "..." }
}
```
**Durum:** ✅ **Uygulandı.**
