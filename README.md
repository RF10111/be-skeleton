# BE Skeleton (NestJS + Prisma + Postgres)

This repository is a backend skeleton implementing:
- NestJS v10 (LTS)
- Prisma v5 (LTS) with PostgreSQL
- JWT auth
- Chat flow that saves conversation history and forwards prompts to an MCP client, which forwards to an MCP server (simulated locally)

Features:
- API endpoints: `POST /auth/register`, `POST /auth/login`, `POST /chat/prompt`
- Prisma models: `User`, `Conversation`, `Message`
- MCP client endpoint: `POST /mcp-client/forward` (forwards to MCP server or remote)
- MCP server endpoint: `POST /mcp-server/process` (simulates LLM reply)

Quick start

1. Copy `.env.example` to `.env` and fill values (especially `DATABASE_URL` and `JWT_SECRET`).

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run in development:

```bash
npm run start:dev
```

API flow (example):
- Frontend calls `POST /chat/prompt` with a JSON body `{ "prompt": "Hello" }` and Authorization `Bearer <token>`.
- Backend saves user message to DB, forwards to MCP client (configurable `MCP_CLIENT_URL`).
- MCP client forwards to MCP server, which returns an LLM-produced answer.
- Backend saves assistant message and returns response to frontend.

Notes
- Update `MCP_CLIENT_URL` to point to your MCP client service in production.
- Replace the MCP server simulation with your actual LLM integration.
- The Prisma schema is at `prisma/schema.prisma`.
