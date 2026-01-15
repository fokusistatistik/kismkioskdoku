# DOKU - Kiosk Entegrasyon Rehberi
## Mobil - Kiosk İletişim Protokolü (v1.0.0)

Bu doküman, DOKU Mobil Uygulaması ile Kiosk cihazları arasındaki veri alışverişi, QR formatları ve API iletişim standartlarını tanımlar.

---

### 1. İletişim Akışı (Overview)

1.  **Kiosk:** Ekranında dinamik bir JWT (JSON Web Token) içeren QR kod üretir.
2.  **Mobil (DOKU):** Kamerası ile bu QR kodu okur.
3.  **Mobil (DOKU):** QR içeriğini çözer (Decode) ve kullanıcıya "Buraya giriş yapmak istiyor musunuz?" diye sorar.
4.  **Mobil (DOKU):** Onay verilirse, sunucuya (Backend API) bir istek atarak geçiş izni ister.
5.  **Sunucu:** İsteği doğrular ve kapıyı/turnikeyi açar.

---

### 2. QR Kod Formatı (JWT Payload)

Kiosk cihazlarının ürettiği QR kod, standart bir **JWT** stringi olmalıdır.
Mobil uygulama, bu token'ın imzasını (Signature) doğrulamaz, sadece Payload (Veri) kısmını okur. İmza doğrulaması Sunucu tarafında yapılmalıdır.

**Örnek Payload:**
```json
{
  "kid": "kiosk-001-uuid",    // Kiosk ID (Unique)
  "nam": "Ana Giriş Turnike 1", // Ekranda görünecek isim
  "loc": "A Blok - Zemin Kat",  // Lokasyon bilgisi
  "iat": 1705512345,          // Oluşturulma zamanı (Unix Timestamp)
  "exp": 1705512375           // (Opsiyonel) Geçerlilik süresi
}
```

*   **nam (Name):** Mobil uygulamada kullanıcıya "Giriş Yapılacak Nokta" olarak gösterilir.
*   **loc (Location):** (Opsiyonel) Alt bilgi olarak gösterilir.

---

### 3. API İsteği (Mobile -> Backend)

Kullanıcı mobilde **"Onayla"** butonuna bastığında, uygulama aşağıdaki formatta bir **POST** isteği gönderir.

**Endpoint:** `POST https://api.fokusistatistik.com/api/mobile/scan` (Örnektir)

**İstek Gövdesi (JSON Payload):**
```json
{
  "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Kiosk'tan okunan HAM QR Verisi
  "user_id": "mock-uuid-xys291", // Kullanıcının UUID'si (Login'den gelen)
  "device_info": {
    "uuid": "device-uuid-mock", // Cihazın benzersiz ID'si
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16...)", // Cihaz/Tarayıcı Bilgisi
    "platform": "iPhone",       // İşletim Sistemi (iOS/Android/Win32)
    "timestamp": "2026-01-15T20:45:00.000Z" // İşlem Zamanı (ISO 8601)
  }
}
```

*   **qr_token:** Backend bu token'ı almalı, imzasını doğrulamalı ve süresinin geçip geçmediğini (iat/exp) kontrol etmelidir.
*   **device_info:** Güvenlik logları için kullanılır. Hangi cihazdan, hangi modelden giriş yapıldığı burada yer alır.

---

### 4. Güvenlik ve Kiosk Modu Gereksinimleri

#### 4.1. HTTPS Zorunluluğu
Mobil uygulamanın kamerayı kullanabilmesi için hem Mobil PWA'nın hem de Kiosk sunucusunun kesinlikle **HTTPS** protokolü üzerinden çalışması gerekmektedir. HTTP (Güvenli olmayan) bağlantılarda tarayıcı kamera izni vermez.

#### 4.2. Tekil Cihaz (Single Device Enforcement)
DOKU Mobil uygulaması, bir TC Kimlik numarasına "kilitlenir".
*   Kullanıcı giriş yaptığında, TC kimlik numarası cihazın `localStorage` alanına "Device Owner" olarak işlenir.
*   Bu cihazdan artık sadece o TC ile işlem yapılabilir.
*   Bu özellik, personelin birbirinin yerine kart basmasını/giriş yapmasını engellemek için tasarlanmıştır.

#### 4.3. Konum Doğrulama (Opsiyonel/Gelecek)
İleride güvenlik seviyesini artırmak için, API isteğine mobil cihazın GPS koordinatları da eklenebilir. Backend, Kiosk'un konumu ile Mobil cihazın konumunu karşılaştırarak "Uzaktan Okutma" sahtekarlığını engelleyebilir.
