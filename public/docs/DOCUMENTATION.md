# Developer Technical Documentation & API Contract

> **Project Build:** SwiftyPay (Builders Track Framework)

This document maps out the specific interface contracts and repository expectations
agreed upon by the development team (as specified in `Swifty task.pdf`,
`Swifty task_2.pdf`, and `Swifty task_3.pdf`).

---

## 1. Monorepo Project Architecture

```text
├── apps/
│   ├── frontend/               # Next.js (TypeScript, Tailwind)
│   │   ├── src/
│   │   │   ├── components/     # Atomic UI items (Form Inputs, Status States)
│   │   │   ├── hooks/          # useTelegram.ts, useFetch.ts
│   │   │   └── app/            # App Router layout
│   │   │       ├── page.tsx            # Screen 1: Terminal Matrix (SAMKIEL)
│   │   │       └── pay/
│   │   │           └── [id]/
│   │   │               └── page.tsx    # Screen 2 & 3: Gateway & Success (ABRAHAM)
│   └── backend/                # Django REST Framework & MongoDB Atlas (TEMI)
```

> **Note:** This frontend was scaffolded with the **App Router** (`src/app/`) per the
> team's decision. The original draft referenced the Pages Router (`src/pages/`); the
> routing semantics are equivalent — `app/page.tsx` is Screen 1 and
> `app/pay/[id]/page.tsx` is Screens 2 & 3.

---

## 2. API Contract & Payload Models

### I. Payment Link Generation

- **Route:** `POST /api/links/create`
- **Headers:** `X-Telegram-Init-Data: <raw_telegram_init_data_string>`

**Request Payload:**

```json
{
  "amount": 10,
  "coin": "USDT",
  "note": "For logo design",
  "telegramUserId": "123456789",
  "telegramUsername": "abraham_dev"
}
```

**Response Payload (`201 Created`):**

```json
{
  "linkId": "a3k9x",
  "url": "https://swiftypay.xyz/pay/a3k9x",
  "expiresAt": "2026-06-09T08:00:00Z"
}
```

### II. Get Payment Link Metadata

- **Route:** `GET /api/links/:id`

**Response Payload (`200 OK`):**

```json
{
  "amount": 10,
  "coin": "USDT",
  "note": "For logo design",
  "requesterUsername": "abraham_dev",
  "status": "pending"
}
```

> **Note:** Valid string returns for `status` are restricted to:
> `"pending" | "paid" | "expired"`.

### III. Post-Payment State Settlement

- **Route:** `POST /api/links/:id/pay`

**Response Payload (`200 OK`):**

```json
{
  "success": true
}
```

### IV. Get AI Token Smart Recommendation

- **Route:** `GET /api/suggest-coin`

**Response Payload (`200 OK`):**

```json
{
  "suggestion": "USDT",
  "reason": "Most stable right now. BTC is up 3% today."
}
```

---

## 3. Environment Variable Standards

### Frontend Development Context (`.env.local`)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend Microservice Context (`.env`)

```bash
MONGO_URI=mongodb+srv://<db_user>:<password>@cluster.mongodb.net/swiftypay
TELEGRAM_BOT_TOKEN=1234567890:ABC_ExampleBotTokenFromBotFather
GROQ_API_KEY=gsk_ExampleGroqEngineCloudKey
COINGECKO_API_KEY=CG-ExampleCoinGeckoRatesKey
```

---

## 4. Frontend Engineering Implementation Rules

- **SDK Safety Initialization:** Do not access Telegram global variables before
  rendering components. Guard all lookups via safe window checks:

  ```ts
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    /* ... */
  }
  ```

- **Authorization Injection:** Intercept all transaction creation API calls to inject
  the verified raw context data via the `X-Telegram-Init-Data` header.
- **Deep-Link Target String Routing:** Ensure the payment checkout interface compiles
  deep link sequences targeting the host app container strictly formatting as:

  ```text
  https://t.me/Swiftyex_bot?start=pay_<linkId>
  ```
