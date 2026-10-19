# BILLION BOYS LONDON — EC Site

A fashion e-commerce website for the apparel brand **Billion Boys London**, built from scratch with vanilla HTML/CSS/JavaScript and integrated with Stripe Checkout for secure payments, deployed via Netlify.

---

## Features

- **Promotional video hero** — Full-screen brand video below a fixed header
- **Product grid** — Responsive grid layout (4 cols → 3 → 2 on mobile)
- **Gender filter** — Toggle between MALE / FEMALE collections
- **Slide-out cart** — Add items, adjust quantity, persisted in localStorage
- **Stripe Checkout integration** — Secure hosted payment page (card info never touches this server)
- **Netlify Functions** — Serverless backend to create Checkout sessions
- **Post-payment page** — Thank-you page that clears the cart on return

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 / CSS3 / Vanilla JavaScript |
| Payments | [Stripe Checkout](https://stripe.com/docs/payments/checkout) |
| Serverless backend | [Netlify Functions](https://docs.netlify.com/functions/overview/) (Node.js ESM) |
| Hosting | [Netlify](https://netlify.com) |

---

## Project Structure

```
billionclub/
├── billionclub.html          # Main page
├── style.css                 # All styles
├── script.js                 # Cart logic, product data, Stripe redirect
├── success.html              # Post-payment thank-you page
├── netlify/
│   └── functions/
│       └── checkout.mjs      # Serverless function: creates Stripe Checkout session
├── netlify.toml              # Netlify build & redirect config
├── package.json              # Stripe SDK dependency
└── .env.example              # Required environment variables (template)
```

---

## How Payments Work

1. Customer adds items to cart (stored in `localStorage`)
2. On **CHECKOUT**, the browser sends `{ priceId, quantity }[]` to `/.netlify/functions/checkout`
3. The serverless function verifies each price against Stripe and creates a Checkout session
4. Customer is redirected to Stripe's hosted payment page
5. On success, redirected back to `/success.html` — cart is cleared

Price amounts are defined in the Stripe Dashboard, **never in the client-side code**, preventing price manipulation.

---

## Local Development

### Prerequisites
- Node.js 18+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm install -g netlify-cli`)
- Stripe account (test mode)

### Setup

```bash
# Install dependencies
npm install

# Copy env template and add your Stripe test secret key
cp .env.example .env
# Edit .env: STRIPE_SECRET_KEY=sk_test_...

# Run locally (serves the site + Netlify Functions)
netlify dev
```

Open `http://localhost:8888`.  
Use Stripe test card `4242 4242 4242 4242` with any future expiry and any CVC.

---

## Deployment (Netlify)

1. Connect this repository to Netlify
2. Set environment variable in **Site configuration → Environment variables**:
   ```
   STRIPE_SECRET_KEY = sk_live_...
   ```
3. Deploy — Netlify installs dependencies and serves the Functions automatically
