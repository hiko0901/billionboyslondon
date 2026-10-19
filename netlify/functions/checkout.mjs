import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const MAX_QTY = 10;
const MAX_LINES = 20;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let items;
  try {
    ({ items } = await req.json());
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    return json({ error: "Cart is empty or too large" }, 400);
  }

  const lineItems = [];
  for (const { priceId, quantity } of items) {
    const qty = Number(quantity);
    if (typeof priceId !== "string" || !priceId.startsWith("price_") ||
        !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return json({ error: "Invalid item" }, 400);
    }
    lineItems.push({ price: priceId, quantity: qty });
  }

  // 販売停止中（非アクティブ）の価格では決済させない
  try {
    const prices = await Promise.all(lineItems.map((li) => stripe.prices.retrieve(li.price)));
    if (prices.some((p) => !p.active)) return json({ error: "Item unavailable" }, 400);
  } catch {
    return json({ error: "Item not found" }, 400);
  }

  const siteUrl = process.env.URL || new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["JP"] },
      phone_number_collection: { enabled: true },
      locale: "ja",
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: "Could not create checkout session" }, 500);
  }
};
