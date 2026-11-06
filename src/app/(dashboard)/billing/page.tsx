// src/app/(dashboard)/billing/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";

function BillingContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

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
          window.location.href = "/billing?payment=success";
        },
        theme: { color: "#171717" },
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
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Billing & Plans</h1>
        <p className="text-sm text-neutral-500">Upgrade your workspace to unlock more AI chats.</p>
      </div>

      {paymentSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          ✓ Payment successful! Your plan will be activated shortly.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(PLANS).map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">₹{plan.pricePaise / 100}</p>
              <p className="text-sm text-neutral-500 mb-6">{plan.chatLimit} chats</p>
              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                className="w-full"
              >
                {loading === plan.id ? "Processing..." : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}