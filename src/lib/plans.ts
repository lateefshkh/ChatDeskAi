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
  "free-trial": {
    id: "free-trial",
    name: "Free Trial",
    type: "one_time",
    pricePaise: 0,
    chatLimit: 10, // <-- 10 free chats
  },
  "starter-once": {
    id: "starter-once",
    name: "Starter Pack (30 Chats)",
    type: "one_time",
    pricePaise: 4900, // ₹49
    chatLimit: 30,    // <-- 30 chats (updated)
  },
  "growth-monthly": {
    id: "growth-monthly",
    name: "Growth Monthly",
    type: "subscription",
    pricePaise: 39900, // ₹399
    chatLimit: 3000,   // 3000 monthly chats
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId];
}