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

### POST /auth/logout
- Deskripsi: Logout user — server menambahkan token JWT ke blacklist (in-memory). Token yang diblacklist tidak lagi dianggap valid sampai server restart (simple implementation).
- Headers: `Authorization: Bearer <TOKEN>`
- Body: kosong
- Success (200):
```json
{ "status": "ok" }
```

Note: For production, use persistent store (Redis) for blacklist.

---

## 2) Chat

### POST /chat (atau POST /chat/:conversationId)
- Deskripsi: Endpoint utama untuk user-facing chat API. Menyimpan prompt user, meneruskan ke MCP client, menyimpan jawaban assistant, dan mengembalikan hasil yang disederhanakan.
- Auth: Required
- Headers: `Authorization: Bearer <TOKEN>`
- Body:
```json
{
  "conversationId": "optional-existing-conv-id",
  "prompt": "Halo, tolong jelaskan arsitektur microservices?"
}
```
- Behavior:
  1. Jika `:conversationId` path param ada, server akan menggunakannya.
  2. Jika tidak ada conversationId, server akan membuat `Conversation` baru untuk user (menggunakan `user.id` dari JWT).
  3. Server menyimpan message role=`user` di DB.
  4. Server memanggil MCP client dengan payload `{ userId, conversationId, message }`.
  5. Setelah menerima jawaban, server menyimpan message role=`assistant`.

- Success (200) contoh response (sederhana):
```json
{
  "status_code": 200,
  "conversationId": "cj_conv_123",
  "user": { "id": "cj_user_1", "content": "Halo, tolong jelaskan..." },
  "assistant": { "answer": "LLM reply (simulated) to: Halo, tolong jelaskan...", "createdAt": "2025-12-23T...", "status_code": 200 }
}
```

- Errors: 400 jika `prompt` kosong, 401 jika token invalid, 403 jika user tidak berhak pada conversation.

Notes: Response disederhanakan — tidak ada nested `raw` fields. Semua pesan tetap dipersist di tabel `Message`.

---

### GET /chat/:conversationId
- Deskripsi: Ambil riwayat pesan untuk `conversationId`. `userId` diambil dari JWT (hanya owner yang dapat mengakses).
- Auth: Required
- Headers: `Authorization: Bearer <TOKEN>`
- Success (200) contoh response:
```json
{
  "status_code": 200,
  "conversationId": "cj_conv_123",
  "userId": "cj_user_1",
  "messages": [
    { "role": "user", "content": "Halo", "createdAt": "..." },
    { "role": "assistant", "content": "...", "createdAt": "..." }
  ]
}
```

---

### GET /chat
- Deskripsi: List conversations milik user (history). `userId` diambil dari JWT.
- Auth: Required
- Headers: `Authorization: Bearer <TOKEN>`
- Success (200) contoh response:
```json
{
  "status_code": 200,
  "conversations": [ { "id": "cj_conv_123", "title": "Conversation", "createdAt": "..." }, ... ]
}
```

---

## 3) MCP Client (internal forwarding)

### POST /mcp-client/forward
- Deskripsi: Service yang meneruskan payload ke MCP server (external/mock). Biasanya dipanggil oleh `ChatService`.
- Body contoh:
```json
{
  "userId": "cj...",
  "conversationId": "cj_conv_123",
  "message": "User prompt text",
  "_targetUrl": "http://localhost:4002/mcp-server/process" // optional override
}
```
- Response contoh (200):
```json
{ "answer": "mcp-client mock -> User prompt text", "raw": { ... }, "status_code": 200 }
```

---

## 4) MCP Server (webhook / mock LLM receiver)

### POST /mcp-server/process
- Deskripsi: Endpoint yang dipanggil oleh MCP client / external system yang mengembalikan jawaban assistant. Server menyimpan assistant message ketika `conversationId` tersedia.
- Body contoh (dari MCP client / external):
```json
{
  "conversationId": "cj_conv_123",
  "answer": "🐍 [Python API] Data Mesin Siemens: Status OPTIMAL | Suhu: 48°C | Speed: 1200rpm",
  "metadata": { "source": "external-llm" }
}
```
- Behavior: Jika `conversationId` dan `answer` ada, server akan menyimpan message role=`assistant` ke DB.
- Success (200) contoh response:
```json
{ "status_code": 200, "ok": true, "assistant": { "answer": "...", "createdAt": "..." } }
```
- Error behavior: jika payload tidak lengkap, server mengembalikan `{ status_code: 400, ok: false, reason: 'missing_conversationId_or_content' }`.

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
2) POST /chat (authenticated)
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
  "user": { "id": "cj_user_1", "content": "Tuliskan ringkasan arsitektur hexagonal" },
  "assistant": { "answer": "LLM reply (simulated) to: Tuliskan ringkasan arsitektur hexagonal" }
}
```

---

## Catatan tambahan untuk developer
- Pastikan environment variable `MCP_CLIENT_URL` diisi jika MCP client berjalan di host berbeda.
- Untuk integrasi LLM asli, ganti implementasi di MCP client/server agar memanggil provider LLM dan kembalikan struktur lengkap (answer + metadata).
- Untuk pagination / read endpoints (history), pertimbangkan menambah:
  - `GET /conversations` — list conversations untuk user
  - `GET /conversations/:id/messages` — list messages for conversation

---

File ini: [endpoint.md](endpoint.md)
