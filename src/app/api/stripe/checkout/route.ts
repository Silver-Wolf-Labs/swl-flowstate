import { NextRequest, NextResponse } from "next/server";

// Stripe price IDs - these will be set up in your Stripe dashboard
// For now, we'll use placeholder IDs that you'll replace after creating products in Stripe
const PRICE_IDS: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || "",
  team_annual: process.env.STRIPE_PRICE_TEAM_ANNUAL || "",
};

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName, isAnnual } = await request.json();

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    // Get the actual Stripe price ID
    const stripePriceId = PRICE_IDS[priceId];
    if (!stripePriceId) {
      return NextResponse.json(
        { error: "STRIPE_NOT_CONFIGURED", message: "Price ID not configured" },
        { status: 503 }
      );
    }

    // Dynamically import Stripe only when needed
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27.acacia",
    });

    // Get the origin for success/cancel URLs
    const origin = request.headers.get("origin") || "https://flowstate-swl.vercel.app";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}?payment=success&plan=${planName}&billing=${isAnnual ? "annual" : "monthly"}`,
      cancel_url: `${origin}?payment=cancelled`,
      metadata: {
        planName,
        isAnnual: isAnnual ? "true" : "false",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

