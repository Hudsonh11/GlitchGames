// Glitch Games Plus — £5.99/month auto-renewing Stripe subscription.
// Creates (once) a recurring price identified by lookup key, then a Checkout session for the signed-in user.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOOKUP_KEY = "glitch_games_plus_monthly_gbp_599";
const ALLOWED_ORIGINS = [/^https:\/\/([a-z0-9-]+\.)*lovable\.app$/, /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/, /^http:\/\/localhost(:\d+)?$/];

async function getPriceId(stripe: Stripe): Promise<string> {
  const existing = await stripe.prices.list({ lookup_keys: [LOOKUP_KEY], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const product = await stripe.products.create({
    name: "Glitch Games Plus",
    description: "Monthly Plus membership: 2,000 coins + 100 gems each month, Plus games and exclusive perks.",
    metadata: { product: "glitch_games_plus" },
  });
  const price = await stripe.prices.create({
    product: product.id, currency: "gbp", unit_amount: 599,
    recurring: { interval: "month" }, lookup_key: LOOKUP_KEY,
  });
  return price.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user?.email) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const requested = typeof body.returnUrl === "string" ? body.returnUrl.replace(/\/+$/, "") : "";
    const base = ALLOWED_ORIGINS.some((r) => r.test(requested)) ? requested : "https://glitchgames.lovable.app";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16" });
    const priceId = await getPriceId(stripe);

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id ??
      (await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })).id;

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
    if (subs.data.some((s) => s.metadata?.product === "glitch_games_plus")) {
      return json({ error: "You already have an active Plus subscription." }, 409);
    }

    const meta = { user_id: user.id, product: "glitch_games_plus" };
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: { metadata: meta },
      metadata: meta,
      success_url: `${base}/rewards?plus=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/rewards?plus=cancelled`,
    });
    return json({ url: session.url }, 200);
  } catch (error) {
    console.error("create-plus-checkout error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
