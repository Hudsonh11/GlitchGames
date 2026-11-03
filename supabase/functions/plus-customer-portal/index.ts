// Opens the dedicated Glitch Games Plus Stripe Customer Portal for the signed-in user.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Portal configuration dedicated to Glitch Games Plus (other apps use their own).
const PORTAL_CONFIG = "bpc_1UXFxOL7PIuW7LcDSxIFTLCz";
const ALLOWED_ORIGINS = [/^https:\/\/([a-z0-9-]+\.)*lovable\.app$/, /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/, /^http:\/\/localhost(:\d+)?$/];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user?.email) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const requested = typeof body.returnUrl === "string" ? body.returnUrl.replace(/\/+$/, "") : "";
    const base = ALLOWED_ORIGINS.some((r) => r.test(requested)) ? requested : "https://glitchgames.lovable.app";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;
    if (!customerId) return json({ error: "No Plus subscription found for this account." }, 404);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: PORTAL_CONFIG,
      return_url: `${base}/rewards`,
    });
    return json({ url: session.url }, 200);
  } catch (e) {
    console.error("plus-customer-portal error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
