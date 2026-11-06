// src/lib/plans.ts
//
// Purpose: Plan definitions — single source of truth.
// Note: Plans are defined in CODE, not in DB. This prevents price tampering.

export type PlanType = "one_time" | "subscription";

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  pricePaise: number;
  chatLimit: number;
}

export const PLANS: Record<string, Plan> = {
  "starter-once": {
    id: "starter-once",
    name: "Starter Pack (5 Chats)",
    type: "one_time",
    pricePaise: 4900, // ₹49 (49 * 100 paise)
    chatLimit: 10,     // 10 chats limit
  },
  "growth-monthly": {
    id: "growth-monthly",
    name: "Growth Monthly",
    type: "subscription",
    pricePaise: 39900, // ₹399 (399 * 100 paise)
    chatLimit: 3000,   // 3000 chats per month
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId];
}