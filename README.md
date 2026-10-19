# BILLION BOYS LONDON — EC Site

A fashion e-commerce website for the apparel brand **Billion Boys London**, built from scratch with vanilla HTML/CSS/JavaScript and integrated with Stripe Checkout for secure payments, deployed via Netlify.

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

