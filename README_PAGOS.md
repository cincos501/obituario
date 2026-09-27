# 🇧🇴 Integración de Pagos con Banco Económico (API Market v1.3.0)

Este documento detalla la arquitectura completa implementada en **Next.js (App Router con TypeScript)** para el procesamiento de pagos con **QR Simple de Banco Económico S.A. (Baneco)** bajo los estándares del sistema financiero de Bolivia (ASFI).

---

## 🏛️ 1. Arquitectura del Módulo

Toda la lógica de integración se encuentra desacoplada en `src/lib/baneco/` y conectada con los endpoints de API y frontend público:

```text
src/
├── lib/
│   └── baneco/
│       ├── crypto.ts    # Cifrado/Descifrado AES-256-CBC con node:crypto (IV 16b + Ciphertext en Base64)
│       ├── client.ts    # Cliente HTTP con Bearer Token en caché de 55 minutos (/api/authentication/authenticate)
│       ├── service.ts   # Fachada de operaciones: generateQR, checkQRStatus, cancelQR y fallback ASFI
│       ├── types.ts     # Interfaces tipadas (GenerateQRParams, StatusQRResult, WebhookPaymentPayload, etc.)
│       └── index.ts     # Exportador central del módulo
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts # POST /api/checkout (crea orden 'PENDING' y genera QR de cobro)
│   │   ├── payments/
│   │   │   └── qr/
│   │   │       └── [qrId]/
│   │   │           └── route.ts # GET /api/payments/qr/[qrId] (polling con auto-conciliación fallback)
│   │   └── webhooks/
│   │       └── baneco/
│   │           └── payment/
│   │               └── route.ts # POST /api/webhooks/baneco/payment (Webhook con protección de idempotencia 24h)
│   └── payments/
│       └── [qrId]/
│           └── page.tsx # Pantalla pública de pago con polling (5s), verificación manual y confirmación WhatsApp
```

---

## 🔐 2. Especificación Criptográfica (AES-256-CBC)

Banco Económico requiere que ciertos datos sensibles (como la contraseña para autenticarse y el número de cuenta bancaria acreditadora) se transmitan cifrados con **AES-256-CBC**:

* **Algoritmo:** `aes-256-cbc`.
* **Clave secreta (`BANECO_AES_KEY`):** Rellenada con bytes nulos (`\0`) o truncada exactamente a **32 bytes**.
* **Vector de Inicialización (IV):** 16 bytes generados aleatoriamente (`crypto.randomBytes(16)`).
* **Formato de Salida:** `Base64(IV + Ciphertext)`.
* **Paddings:** PKCS#7 estándar (soportado de forma nativa por Node.js `createCipheriv`).

---

## 🌐 3. Configuración de Variables de Entorno

En tu archivo `.env.local` (o en las variables de entorno de Vercel):

```env
# URL base del ApiGateway de Banco Económico
BANECO_BASE_URL=https://apimkt.baneco.com.bo/ApiGateway/

# Credenciales de acceso de API Market
BANECO_USERNAME=A122622560
BANECO_PASSWORD=1502

# Clave de cifrado AES-256 (32 bytes)
BANECO_AES_KEY=D783FBCE6A634FE189DDE6FB525125E3

# Número de cuenta destino en Banco Económico (Santa Cruz, Bolivia)
BANECO_ACCOUNT=6111329426

# Timeout de peticiones HTTP en segundos
BANECO_TIMEOUT=30

# URL pública de tu aplicación (para links de pago y notificaciones)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛠️ 4. Guía para Pruebas Locales del Webhook con Túnel

Para recibir notificaciones del banco en tu entorno de desarrollo local, debes exponer tu servidor mediante un túnel público:

### Opción A: Usando Cloudflare Tunnels (Recomendado)
```bash
# En una terminal separada:
cloudflared tunnel --url http://localhost:3000
```
Te entregará una URL como: `https://xxxx-xxxx.trycloudflare.com`

### Opción B: Usando ngrok
```bash
ngrok http 3000
```
Te entregará una URL como: `https://xxxx-xxxx.ngrok-free.app`

### Configurar en Banco Económico:
Registra como URL de notificación (Webhook):
`https://tu-url-del-tunel/api/webhooks/baneco/payment`

---

## 🧪 5. Comandos de Prueba (cURL)

### 1. Crear una orden de pago y generar QR:
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 341.00,
    "planId": "legado",
    "planName": "Plan Homenaje Legado",
    "payerName": "Carlos Mendoza",
    "payerEmail": "carlos@ejemplo.com",
    "payerPhone": "+59170012345"
  }'
```
*Respuesta:* Retorna `{ "success": true, "qrId": "QR-BNE-...", "paymentUrl": "http://localhost:3000/payments/QR-BNE-..." }`.

### 2. Consultar estado del pago (Frontend Polling):
```bash
curl -X GET http://localhost:3000/api/payments/qr/QR-BNE-1790523686983-1330
```
*Si Baneco ya acreditó el pago, la llamada auto-conciliará el estado de `PENDING` a `CONFIRMED` automáticamente.*

### 3. Simular llamada del Webhook de Banco Económico:
```bash
curl -X POST http://localhost:3000/api/webhooks/baneco/payment \
  -H "Content-Type: application/json" \
  -d '{
    "qrId": "QR-BNE-1790523686983-1330",
    "transactionId": "BNE-1790523686983-1330",
    "paymentDate": "2026-09-27",
    "paymentTime": "12:30:00",
    "currency": "BOB",
    "amount": 341.00
  }'
```
*Respuesta:* `{"success": true, "message": "Notificación procesada y orden confirmada exitosamente."}`  
*Si se repite la llamada dentro de las 24 horas, responderá inmediatamente con HTTP 200 sin duplicar la acreditación (Idempotencia).*

---

## 🛡️ 6. Resiliencia y Fallback ASFI

El sistema cuenta con un mecanismo de **doble garantía**:
1. Si el ApiGateway de Banco Económico responde normalmente, se utiliza el QR nativo devuelto por el banco.
2. Si la conexión remota con el banco presenta latencia, timeout o firewall en desarrollo, el servicio genera automáticamente el payload oficial **EMVCo ASFI con el código bancario 0010 (Banco Económico) y la cuenta 6111329426**, renderizando un código QR 100% escaneable desde Baneco Móvil y cualquier app bancaria de Bolivia.
3. El frontend consulta en tiempo real cada 5 segundos y cuenta con botón manual de verificación instantánea y envío de comprobante directo a WhatsApp.
