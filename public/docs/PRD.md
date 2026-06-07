# Product Requirement Document (PRD) — SwiftyPay

> **Track:** Builders Track (SwiftyEx Hackfest 2026 — Mini-App & Integration Focus)

---

## 1. Executive Summary & Problem Statement

Within the SwiftyEx ecosystem, requesting peer-to-peer crypto payments currently
forces users to copy and share raw cryptographic wallet addresses. This process
introduces friction, security concerns, and user errors.

**SwiftyPay** is a Telegram Mini App built directly into **SwiftyExBot**
(referencing the requirements outlined in `Swifty task.pdf`, `Swifty task_2.pdf`,
and `Swifty task_3.pdf`). It replaces raw address sharing with a clean, dynamic,
shareable payment link.

Beyond simplifying payments, SwiftyPay serves as a frictionless **user acquisition
engine**: when non-users click a payment link, they are automatically routed to
onboard via SwiftyExBot to complete the transaction.

---

## 2. Core Workflows & User Journey

1. **Generation** — A SwiftyEx user opens the Mini App from inside SwiftyExBot,
   fills a lightweight request form (amount, coin, optional note), gets an
   AI-optimized coin suggestion, and generates a short link.
2. **Distribution** — The user copies the link and shares it across any platform
   (WhatsApp, X, Instagram, Telegram group chats, etc.).
3. **Execution** — The recipient opens the web page link, clicks **Pay Now**, and
   is deep-linked directly back into SwiftyExBot to authorize and execute the
   crypto settlement securely.
4. **Fulfillment** — The creator/sender is immediately notified inside Telegram of
   successful payment clearance.

---

## 3. Product Scope & Screen Matrix

### Screen 1 — Request & Link Terminal _(Assigned to: SAMKIEL)_

- **Telegram Context Extraction:** On app load, initialize the Telegram Web App SDK
  to silently extract the authenticated user's Telegram `userId` and `username`.
- **Input Parameters:**
  - Numerical input for amount.
  - Custom drop-down selector for asset choices (USDT, BTC, ETH).
  - Optional character-limited text area for a payment note.
- **AI Assistance Layer:** Render a real-time smart asset recommendation badge
  powered by an asynchronous fetch from the backend AI recommendation endpoint.
- **Link Compilation:** A core trigger button to execute the payment request. Upon
  backend success, display the target shareable payment link alongside a single-tap
  **"Copy Link"** clipboard component.

### Screen 2 — Host Gateway Payment Interface _(Assigned to: ABRAHAM)_

- **Metadata Hydration:** Dynamic layout rendering the requester's identity,
  requested amount, requested asset token, and the customized note text.
- **Deep-Link Protocol:** A prominent call-to-action **Pay Now** button designed to
  execute deep-linking parameters directly into SwiftyExBot.
- **Edge-Case Handlers:** Graceful routing fallback layouts for invalid/expired
  links (48-hour time-to-live limit) or links that have already processed a
  transaction settlement.

### Screen 3 — Transaction Success Ledger _(Assigned to: ABRAHAM)_

- **Confirmation Display:** A success confirmation layout triggered by
  webhook/state verification showing the precise transaction volume and asset
  cleared.

### Platform Integration & Bot Automation _(Assigned to: TOBI)_

- **Bot Configuration:** Register and maintain the active test bot instance within
  Telegram **@BotFather** (using links like
  [https://t.me/Swiftyex_bot](https://t.me/Swiftyex_bot) or
  [https://t.me/swiftyexbot](https://t.me/swiftyexbot)).
- **Mini App Hooking:** Connect and configure the custom Mini App menu button within
  the chat wrapper.
- **Asynchronous Webhooks:** Establish real-time push messaging notifications
  dispatched to the original link creator once payment status is updated to
  `cleared`.

---

## 4. Technical Constraints & Security Handshakes

- **Data Verification:** The backend system must validate the integrity of every
  single request by cryptographically verifying the raw Telegram `initData`
  signature string.
- **Anti-Spam Rate Limits:** Enforce an immutable platform boundary restricting link
  creation to a maximum of **10 links per user profile per 24-hour cycle**.
- **Data Lifecycle:** Links utilize strict Time-To-Live (TTL) criteria, automatically
  expiring **48 hours** after creation.
- **Sandbox Compliance:** All systems operate inside the hackfest's controlled sandbox
  testing environment; no direct production database adjustments are permitted.
