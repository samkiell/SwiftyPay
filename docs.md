Developer Technical Documentation & API ContractProject Build: SwiftyPay (Builders Track Framework)This document maps out the specific interface contracts and repository expectations agreed upon by the development team (as specified in Swifty task.pdf, Swifty task_2.pdf, and Swifty task_3.pdf).1. Monorepo Project Architecture├── apps/
│   ├── frontend/               # Next.js 14+ (TypeScript, Tailwind)
│   │   ├── src/
│   │   │   ├── components/     # Atomic UI items (Form Inputs, Status States)
│   │   │   ├── hooks/          # useTelegram.ts, useFetch.ts
│   │   │   └── pages/          # Page Routing Layout
│   │   │       ├── index.tsx   # Screen 1: Terminal Matrix (SAMKIEL)
│   │   │       └── pay/
│   │   │           └── [id].tsx # Screen 2 & 3: Gateway & Success (ABRAHAM)
│   └── backend/                # Django REST Framework & MongoDB Atlas (TEMI)
2. API Contract & Payload ModelsI. Payment Link GenerationRoute: POST /api/links/createHeaders: X-Telegram-Init-Data: <raw_telegram_init_data_string>Request Payload:{
  "amount": 10,
  "coin": "USDT",
  "note": "For logo design",
  "telegramUserId": "123456789",
  "telegramUsername": "abraham_dev"
}
Response Payload (201 Created):{
  "linkId": "a3k9x",
  "url": "https://swiftypay.xyz/pay/a3k9x",
  "expiresAt": "2026-06-09T08:00:00Z"
}
II. Get Payment Link MetadataRoute: GET /api/links/:idResponse Payload (200 OK):{
  "amount": 10,
  "coin": "USDT",
  "note": "For logo design",
  "requesterUsername": "abraham_dev",
  "status": "pending"
}
Note: Valid string returns for status are restricted to: "pending" | "paid" | "expired".III. Post-Payment State SettlementRoute: POST /api/links/:id/payResponse Payload (200 OK):{
  "success": true
}
IV. Get AI Token Smart RecommendationRoute: GET /api/suggest-coinResponse Payload (200 OK):{
  "suggestion": "USDT",
  "reason": "Most stable right now. BTC is up 3% today."
}
3. Environment Variable StandardsFrontend Development Context (.env.local)NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
Backend Microservice Context (.env)MONGO_URI=mongodb+srv://<db_user>:<password>@cluster.mongodb.net/swiftypay
TELEGRAM_BOT_TOKEN=1234567890:ABC_ExampleBotTokenFromBotFather
GROQ_API_KEY=gsk_ExampleGroqEngineCloudKey
COINGECKO_API_KEY=CG-ExampleCoinGeckoRatesKey
4. Frontend Engineering Implementation RulesSDK Safety Initialization: Do not access Telegram global variables before rendering components. Guard all lookups via safe window checks:if (typeof window !== 'undefined' && window.Telegram?.WebApp) { ... }
Authorization Injection: Intercept all transaction creation API calls to inject the verified raw context data via the X-Telegram-Init-Data header.Deep-Link Target String Routing: Ensure the payment checkout interface compiles deep link sequences targeting the host app container strictly formatting as: https://t.me/Swiftyex_bot?start=pay_<linkId>.