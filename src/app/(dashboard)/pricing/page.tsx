// src/app/(dashboard)/pricing/page.tsx
"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Check, Sparkles, ShieldCheck } from "lucide-react";

const PLANS = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: "₹0",
    period: "forever",
    chats: "10 free chats",
    features: ["10 free AI chats", "1 knowledge source", "Lead capture with phone encryption", "Dashboard access"],
    cta: "Current Plan",
    highlighted: false,
    disabled: true,
  },
  {
    id: "starter-once",
    name: "Starter Pack",
    price: "₹49",
    period: "one-time",
    chats: "30 additional chats",
    features: ["30 additional chats", "Unlimited sources", "Lead capture & webhooks", "Priority support"],
    cta: "Buy Starter Pack",
    highlighted: true,
    disabled: false,
  },
  {
    id: "growth-monthly",
    name: "Growth Monthly",
    price: "₹399",
    period: "/month",
    chats: "3,000 chats/month",
    features: ["3,000 chats per month", "Fair-use 100/day", "Unlimited sources", "Priority streaming latency"],
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
        theme: { color: "#0D4B37" },
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
    <div className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F3EE] border border-[#CDE5DA] text-[#0D4B37] text-xs font-semibold mb-2">
          <span>Billing & Upgrades</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#18181B] tracking-tight">Simple Pricing</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Start free with 10 chats. Upgrade anytime to handle more customer inquiries.
        </p>
      </div>

      {paymentSuccess && (
        <div className="p-4 bg-[#E8F3EE] border border-[#CDE5DA] rounded-2xl text-[#0D4B37] text-xs font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Payment successful! Your quota has been updated. Refresh to view your new balance.</span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-[28px] p-8 flex flex-col justify-between relative shadow-sm ${
              plan.highlighted
                ? "border-2 border-[#0D4B37] shadow-[0_16px_36px_-10px_rgba(13,75,55,0.15)]"
                : "border border-black/[0.04]"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D4B37] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}
            <div>
              <h2 className="text-base font-bold text-[#18181B]">{plan.name}</h2>
              <div className="my-5">
                <span className="text-4xl font-extrabold text-[#18181B]">{plan.price}</span>
                <span className="text-xs text-[#71717A] ml-1.5">{plan.period}</span>
              </div>
              <p className="text-xs font-medium text-[#0D4B37] mb-5">{plan.chats}</p>
              <ul className="space-y-2.5 text-xs text-[#52525B] mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0D4B37] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.disabled || loading === plan.id}
              className={`w-full py-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                plan.disabled
                  ? "bg-[#F4F3EE] text-[#A1A1AA] cursor-not-allowed"
                  : plan.highlighted
                  ? "tactile-pill-btn"
                  : "tactile-pill-secondary"
              }`}
            >
              {loading === plan.id ? "Processing..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#A1A1AA] text-center pt-2">
        Payments are secured with 256-bit encryption through Razorpay.
      </p>
    </div>
  );
}
