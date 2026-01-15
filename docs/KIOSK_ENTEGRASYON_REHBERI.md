# DOKU - Kiosk Entegrasyon Rehberi
## Mobil - Kiosk İletişim Protokolü (v1.1.0)

Bu doküman, DOKU Mobil Uygulaması ile Kiosk cihazları arasındaki veri alışverişi, QR formatları ve API iletişim standartlarını tanımlar.

---

### 1. İletişim Akışı (Overview)

1.  **Kiosk:** Ekranında dinamik bir JWT (JSON Web Token) içeren QR kod üretir.
2.  **Mobil (DOKU):** Kamerası ile bu QR kodu okur.
3.  **Mobil (DOKU):** QR içeriğini çözer ve "QR Okundu" bildirimi verir.
4.  **Mobil (DOKU):** Kullanıcı "Onayla" dediğinde, sunucuya **Ad, Soyad, TC** ve **Cihaz Bilgisi** içeren bir veri paketi gönderir.
5.  **Sunucu/Kiosk:** Gelen isteği doğrular, kapıyı açar ve Kiosk ekranında **"Hoşgeldiniz Sayın [Ad Soyad]"** mesajını gösterir.

---

### 2. QR Kod Formatı (JWT Payload)

**Örnek Payload:**
```json
{
  "kid": "kiosk-001-uuid",    // Kiosk ID
  "nam": "Ana Giriş Turnike 1",
  "loc": "A Blok - Zemin Kat",
  "iat": 1705512345
}
```

---

### 3. API İsteği (Mobile -> Backend)

Mobil uygulamanın gönderdiği zenginleştirilmiş veri yapısı aşağıdadır:

**Endpoint:** `POST https://api.fokusistatistik.com/api/mobile/scan`

**İstek Gövdesi (JSON Payload):**
```json
{
  "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  "user_id": "12345678901",       // TC Kimlik No
  "user_name": "Ahmet Yılmaz",    // Ad Soyad (Mobilde girilen)
  
  "device_info": {
    "uuid": "12345678901",        // Cihaz Sahibi TC (Binding ID)
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16...)",
    "platform": "iPhone",         // iOS, Android, vb.
    "timestamp": "2026-01-15T20:45:00.000Z"
  }
}
```

*   **user_name:** Kiosk ekranında karşılama mesajı ("Hoşgeldiniz Ahmet Yılmaz") göstermek için kullanılmalıdır.
*   **device_info:** Güvenlik logları için kullanılır.

---

### 4. Güvenlik ve Kiosk Modu Gereksinimleri

#### 4.1. HTTPS Zorunluluğu
Kamera erişimi için HTTPS şarttır.

#### 4.2. Tekil Cihaz (Single Device Enforcement)
DOKU Mobil uygulaması, bir TC Kimlik numarasına "kilitlenir".

#### 4.3. Kiosk Ekranı Geri Bildirimi
Backend, mobil cihazdan gelen `user_name` bilgisini WebSocket veya Polling yöntemiyle anlık olarak Kiosk arayüzüne iletmeli ve ekranda görsel bir karşılama animasyonu tetiklemelidir.
