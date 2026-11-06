// trigger-webhook.ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { createHmac } from "node:crypto";

// ⚠️ YAHAN APNI VALUES DAALEIN ⚠️
const TENANT_ID = "37d0805d-cb28-47f9-a8f9-0d2670f448dd";
const ORDER_ID = "order_TwvUsLqXApTk7Q"; // Aapka latest order ID
const PLAN_ID = "starter-once"; // ya "growth-monthly"

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;
const WEBHOOK_URL = "http://localhost:3000/api/payments/webhook";

async function main() {
  const payload = {
    event: "payment.captured",
    event_id: `evt_test_${Date.now()}`,
    payload: {
      payment: {
        entity: {
          id: `pay_TEST_${Date.now()}`,
          order_id: ORDER_ID,
          status: "captured",
          amount: 4900,
          currency: "INR",
          notes: {
            tenantId: TENANT_ID,
            planId: PLAN_ID,
          },
        },
      },
    },
  };

  const rawBody = JSON.stringify(payload);
  
  const signature = createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  console.log("Sending webhook to:", WEBHOOK_URL);
  
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
    },
    body: rawBody,
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}

main().catch(console.error);