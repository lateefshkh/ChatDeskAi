// src/app/(dashboard)/pricing/page.tsx
"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

const PLANS = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: "₹0",
    chats: "10 chats",
    features: ["10 free chats", "1 knowledge source", "Lead capture"],
    cta: "Current Plan",
    highlighted: false,
    disabled: true,
  },
  {
    id: "starter-once",
    name: "Starter Pack",
    price: "₹49",
    chats: "30 chats",
    features: ["30 additional chats", "Unlimited sources", "Priority support"],
    cta: "Buy Starter",
    highlighted: true,
    disabled: false,
  },
  {
    id: "growth-monthly",
    name: "Growth Monthly",
    price: "₹399",
    chats: "3,000 chats/month",
    features: ["3,000 chats per month", "Fair-use 100/day", "Priority support"],
    cta: "Start Growth",
    highlighted: false,
    disabled: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPaymentSuccess(params.get("payment") === "success");
    }
  }, []);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ChatDesk",
        description: `Upgrade to ${planId}`,
        order_id: data.orderId,
        handler: function () {
          window.location.href = "/pricing?payment=success";
        },
        theme: { color: "#6366F1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Payment failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {paymentSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          ✓ Payment successful! Your plan will be activated shortly. Refresh in a moment to see updated quota.
        </div>
      )}

      <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">Simple pricing</h1>
      <p className="text-sm text-muted-foreground mb-10 text-center">
        Start free. Upgrade when you need more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-card border rounded-xl p-6 relative ${
              plan.highlighted ? "border-primary" : "border-border"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-semibold mb-2 text-foreground">{plan.name}</h2>
            <p className="text-3xl font-bold mb-1 text-foreground">{plan.price}</p>
            <p className="text-sm text-muted-foreground mb-4">{plan.chats}</p>
            <ul className="space-y-1 mb-6 text-sm text-foreground">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.disabled || loading === plan.id}
              className={`block text-center w-full py-2.5 rounded-lg text-sm font-medium transition-opacity ${
                plan.disabled
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : plan.highlighted
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-secondary text-secondary-foreground hover:opacity-90"
              }`}
            >
              {loading === plan.id ? "Processing..." : plan.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Note: Uploaded content is sent to third-party AI providers for processing.
      </p>
    </div>
  );
}