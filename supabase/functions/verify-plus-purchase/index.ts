// Glitch Games Plus — £5.99/month auto-renewing Stripe subscription (via Payment Link).
// Called with { session_id } after checkout, or with {} to sync renewals.
// Each paid billing period gets one plus_subscriptions row (keyed by subscription + period end),
// which grants 30-day access + 2,000 coins + 100 gems + Premium Battle Pass once per period.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.session_id || "").trim();
    if (sessionId && !sessionId.startsWith("cs_")) return json({ error: "Invalid session_id" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16" });

    let subscription: Stripe.Subscription | null = null;

    // Admins get Plus free: verified server-side via user_roles, no Stripe involved.
    if (body.admin_free === true) {
      const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      const now = Math.floor(Date.now() / 1000);
      subscription = {
        id: `admin_${user.id}`, status: "active", currency: "gbp",
        current_period_start: now,
        // one row per 30-day window so it can't be re-granted repeatedly
        current_period_end: Math.ceil((now + 30 * 86400) / (30 * 86400)) * 30 * 86400,
        items: { data: [{ price: { unit_amount: 0 } }] }, latest_invoice: null,
      } as unknown as Stripe.Subscription;
    }

    if (subscription) {
      // admin path already resolved
    } else if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
      const owner = session.client_reference_id || session.metadata?.user_id;
      const emailMatch = session.customer_details?.email?.toLowerCase() === user.email?.toLowerCase();
      if (session.payment_status !== "paid" || (owner !== user.id && !(owner == null && emailMatch))) {
        return json({ ok: false, reason: "not_paid_or_mismatched" }, 200);
      }
      subscription = session.subscription as Stripe.Subscription | null;
    } else if (user.email) {
      // Renewal sync: find an active subscription for this email.
      const customers = await stripe.customers.list({ email: user.email, limit: 5 });
      for (const c of customers.data) {
        const subs = await stripe.subscriptions.list({ customer: c.id, status: "active", limit: 5 });
        if (subs.data.length) { subscription = subs.data[0]; break; }
      }
    }

    if (!subscription || !["active", "trialing"].includes(subscription.status)) {
      return json({ ok: false, reason: "no_active_subscription" }, 200);
    }

    const periodEnd = new Date(subscription.current_period_end * 1000);
    const periodKey = `sub_${subscription.id}_${subscription.current_period_end}`;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { error: insertErr } = await admin.from("plus_subscriptions").insert({
      user_id: user.id,
      status: "active",
      source: "purchase",
      starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
      expires_at: periodEnd.toISOString(),
      amount_cents: subscription.items.data[0]?.price?.unit_amount ?? 599,
      currency: subscription.currency ?? "gbp",
      stripe_session_id: periodKey,
      stripe_payment_id: (subscription.latest_invoice as string) || null,
    });

    if (insertErr && (insertErr as { code?: string }).code !== "23505") {
      console.error("plus insert failed", insertErr);
      return json({ error: "Failed to record" }, 500);
    }

    const isNewPeriod = !insertErr;
    if (isNewPeriod) {
      const { data: profile } = await admin.from("profiles").select("coins, gems").eq("user_id", user.id).single();
      if (profile) {
        await admin.from("profiles").update({
          coins: (profile.coins ?? 0) + 2000,
          gems: (profile.gems ?? 0) + 100,
          priority_support: true,
        }).eq("user_id", user.id);
      }
      await admin.from("battle_pass_purchases").insert({
        user_id: user.id, season: "season_1", status: "completed",
        amount_cents: 0, currency: "gbp", stripe_session_id: `plus_${periodKey}`,
      });
      await admin.from("player_titles").insert({ user_id: user.id, title_id: "plus_member", equipped: false });
      await admin.from("player_borders").insert({ user_id: user.id, border_id: "plus_animated", equipped: false });
      await admin.from("activity_feed").insert({
        user_id: user.id, activity_type: "purchase", content: "Joined Glitch Games Plus! ⚡",
      });
    }

    return json({ ok: true, new_period: isNewPeriod, expires_at: periodEnd.toISOString() }, 200);
  } catch (err) {
    console.error("verify-plus-purchase error", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
