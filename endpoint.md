# API Endpoint Documentation

Dokumentasi endpoint untuk backend `be-skeleton` (NestJS + Prisma + Postgres).
Semua contoh menggunakan JSON. Jika endpoint butuh authentication, sertakan header:

Authorization: Bearer <JWT_TOKEN>

---

## Models (ringkasan)

- User
  - id: string
  - email: string
  - name?: string
  - createdAt: datetime

- Conversation
  - id: string
  - userId: string
  - title?: string
  - createdAt: datetime

- Message
  - id: string
  - conversationId: string
  - role: string ("user" | "assistant" | "system")
  - content: string
  - metadata?: object
  - createdAt: datetime

---

## 1) Auth

### POST /auth/register
- Deskripsi: Buat user baru.
- Headers: none
- Body (application/json):

```json
{
  "email": "alice@example.com",
  "password": "secret123",
  "name": "Alice"
}
```

- Success Response (201/200):
```json
{
  "id": "cj...",
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "2025-12-23T..."
}
```
- Error: 400 jika payload tidak valid, 409 jika email sudah terdaftar.

---

### POST /auth/login
- Deskripsi: Validasi kredensial dan mengembalikan JWT.
- Body:
```json
{ "email": "alice@example.com", "password": "secret123" }
```
- Success Response (200):
```json
{ "access_token": "eyJ..." }
```
- Error: 401 atau objek error sederhana jika kredensial salah.

---

### POST /auth/me
- Deskripsi: Ambil data user dari token JWT.
- Headers: `Authorization: Bearer <TOKEN>`
- Body: kosong
- Success (200):
```json
{
  "id":"cj...",
  "email":"alice@example.com",
  "name":"Alice",
  "createdAt":"2025-12-23T..."
}
```

---

## 2) Chat

### POST /chat/prompt
- Deskripsi: Endpoint utama: menyimpan prompt user, meneruskan ke MCP client, menyimpan jawaban assistant, dan mengembalikan hasil.
- Auth: Required
- Headers: `Authorization: Bearer <TOKEN>`
- Body:
```json
{
  "conversationId": "optional-existing-conv-id",
  "prompt": "Halo, tolong jelaskan arsitektur microservices?"
}
```
- Flow internal:
  1. Jika `conversationId` tidak disediakan, BE membuat `Conversation` baru untuk user.
  2. BE menyimpan message role=`user` ke tabel `Message`.
  3. BE memanggil MCP client (`MCP_CLIENT_URL` konfigurasi) dengan payload berisi `userId`, `conversationId`, `message`.
  4. MCP client meneruskan ke MCP server yang memanggil LLM (di mock sekarang).
  5. BE menyimpan jawaban assistant ke tabel `Message`.
- Success (200) contoh response:
```json
{
  "conversationId": "cj_conv_123",
  "result": {
    "user": {
      "id": "cj_msg_user_1",
      "conversationId": "cj_conv_123",
      "role": "user",
      "content": "Halo, tolong jelaskan arsitektur microservices?",
      "createdAt": "2025-12-23T..."
    },
    "assistant": {
      "answer": "LLM reply (simulated) to: Halo, tolong jelaskan arsitektur microservices?"
    }
  }
}
```
- Errors: 400 jika `prompt` kosong, 401 jika token invalid.

Notes: `result.assistant.answer` berasal dari MCP server (LLM). Full assistant message is also persisted in DB as `Message`.

---

## 3) MCP Client (internal forwarding endpoint)

### POST /mcp-client/forward
- Deskripsi: Endpoint yang menerima forward dari BE atau FE (tergantung arsitektur tim AI). MCP client akan meneruskan payload ke MCP server.
- Headers: optional
- Body contoh:
```json
{
  "userId": "cj...",
  "conversationId": "cj_conv_123",
  "message": "User prompt text",
  "_targetUrl": "http://localhost:4002/mcp-server/process" // optional override
}
```
- Behavior:
  - Jika `_targetUrl` disertakan, MCP client akan memanggil URL tersebut.
  - Jika tidak, MCP client memanggil konfigurasi default yang dipakai di service.
- Response contoh (200):
```json
{ "answer": "mcp-client mock -> User prompt text" }
```
- Error: 502/504 jika forward gagal; service menyediakan fallback mock (lihat kode).

---

## 4) MCP Server (mock LLM)

### POST /mcp-server/process
- Deskripsi: Simulasi MCP server yang memanggil LLM. Mengembalikan jawaban tekstual.
- Body contoh:
```json
{ "userId": "cj...", "conversationId": "cj_conv_123", "message": "User prompt text" }
```
- Success (200):
```json
{ "answer": "LLM reply (simulated) to: User prompt text" }
```

---

## 5) Database / Riwayat
Setelah flow, kedua pesan (role=`user` dan role=`assistant`) disimpan di tabel `Message` dengan `conversationId`. Gunakan Prisma client untuk query:

- Ambil semua message untuk conversation:
```ts
prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } })
```

---

## Contoh end-to-end request (client)
1) Login -> dapat token
2) POST /chat/prompt
Headers:
```
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```
Body:
```json
{ "prompt": "Tuliskan ringkasan arsitektur hexagonal" }
```
Response:
```json
{
  "conversationId": "cj_conv_abc",
  "result": { "user": {...}, "assistant": { "answer": "LLM reply (simulated) to: Tuliskan ringkasan arsitektur hexagonal" } }
}
```

---

## Catatan tambahan untuk developer
- Pastikan environment variable `MCP_CLIENT_URL` diisi jika MCP client berjalan di host berbeda.
- Untuk integrasi LLM asli, ganti implementasi di `/mcp-server/process` agar memanggil LLM provider (OpenAI, Anthropic, internal API) dan kembalikan struktur:
```json
{ "answer": "...full text...", "metadata": { "model": "gpt-x", "usage": {...} } }
```
- Untuk pagination / read endpoints (history), tambahkan GET endpoints:
  - `GET /conversations` — list conversations untuk user
  - `GET /conversations/:id/messages` — list messages for conversation

---

File ini: [endpoint.md](endpoint.md)
