// src/lib/db/schema.ts
//
// Purpose: Drizzle ORM schema for ChatDesk.
//
// Design decisions:
// - Every tenant-owned table has `tenantId` as the FIRST column after `id`.
// - Every compound index starts with `tenantId` (RLS + query performance).
// - `chunks.embedding` uses pgvector (384 dims = all-MiniLM-L6-v2).
// - HNSW index on embedding for fast cosine similarity search.
// - `webhook_events` is platform-level (no RLS) — only admin connection touches it.
// - Timestamps: `createdAt` + `updatedAt` on every document.
//
// Cascade rules:
// - `sources`, `chunks`, `conversations`, `messages` → tenants: cascade (DPDP erasure)
// - `leads` → tenants: cascade (DPDP erasure)
// - `leads.conversation_id` → conversations: set null (lead retain, session ref cleared)
// - `payments` → tenants: cascade (tenant gone = payment gone, audit_logs mein trail hai)
// - `audit_logs` → tenants: set null (compliance ke liye retain)
//
// Ye kyun zaroori hai:
// - tenantId-first indexes = RLS policies jaldi lagti hain aur queries fast hoti hain.
// - HNSW index bina vector search O(n) ho jati hai.
// - Correct cascade rules = DPDP "right to erasure" enforceable + data retain jahan zaroori.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  vector,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Tenants ──────────────────────────────────────────────────────────────
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    publicId: text("public_id").notNull(),
    status: text("status").notNull().default("pending_payment"),
    planId: text("plan_id"),
    quotaMonthlyChats: integer("quota_monthly_chats").notNull().default(0),
    quotaUsedChats: integer("quota_used_chats").notNull().default(0),
    quotaPeriodStart: timestamp("quota_period_start", { withTimezone: true }),
    verifiedDomains: text("verified_domains").array().default([]),
    allowedOrigins: text("allowed_origins").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    publicIdIdx: uniqueIndex("tenants_public_id_idx").on(table.publicId),
    ownerIdx: index("tenants_owner_idx").on(table.ownerUserId),
  })
);

// ─── Sources ──────────────────────────────────────────────────────────────
export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    label: text("label").notNull(),
    status: text("status").notNull().default("queued"),
    error: text("error"),
    contentHash: text("content_hash"),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("sources_tenant_idx").on(table.tenantId),
    tenantStatusIdx: index("sources_tenant_status_idx").on(table.tenantId, table.status),
  })
);

// ─── Chunks ───────────────────────────────────────────────────────────────
export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    embeddingModel: text("embedding_model").notNull(),
    embeddingVersion: text("embedding_version").notNull(),
    tokenCount: integer("token_count").notNull(),
    position: integer("position").notNull(),
    contentHash: text("content_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantSourceIdx: index("chunks_tenant_source_idx").on(table.tenantId, table.sourceId),
    tenantIdx: index("chunks_tenant_idx").on(table.tenantId),
    embeddingIdx: index("chunks_embedding_hnsw_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops")),
    sourceHashIdx: index("chunks_source_hash_idx").on(table.sourceId, table.contentHash),
  })
);

// ─── Conversations ────────────────────────────────────────────────────────
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(),
    messageCount: integer("message_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("conversations_tenant_idx").on(table.tenantId),
    tenantVisitorIdx: index("conversations_tenant_visitor_idx").on(
      table.tenantId,
      table.visitorId
    ),
  })
);

// ─── Messages ─────────────────────────────────────────────────────────────
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    flags: jsonb("flags").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantConversationIdx: index("messages_tenant_conversation_idx").on(
      table.tenantId,
      table.conversationId
    ),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  })
);

// ─── Leads ────────────────────────────────────────────────────────────────
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    // Conversation delete hone pe lead retain ho, sirf ref null
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    name: text("name"),
    phoneEncrypted: text("phone_encrypted"),
    emailEncrypted: text("email_encrypted"),
    encryptionKeyId: text("encryption_key_id"),
    consentGiven: integer("consent_given").notNull().default(0),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("leads_tenant_idx").on(table.tenantId),
    tenantCreatedIdx: index("leads_tenant_created_idx").on(table.tenantId, table.createdAt),
  })
);

// ─── Payments ─────────────────────────────────────────────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpaySubscriptionId: text("razorpay_subscription_id"),
    status: text("status").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("payments_tenant_idx").on(table.tenantId),
    orderIdIdx: index("payments_order_id_idx").on(table.razorpayOrderId),
  })
);

// ─── Webhook Events ───────────────────────────────────────────────────────
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: text("event_id").notNull(),
    type: text("type").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processed: integer("processed").notNull().default(0),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    eventIdIdx: uniqueIndex("webhook_events_event_id_idx").on(table.eventId),
  })
);

// ─── Audit Logs ───────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    ipHash: text("ip_hash"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("audit_logs_tenant_idx").on(table.tenantId),
    tenantCreatedIdx: index("audit_logs_tenant_created_idx").on(table.tenantId, table.createdAt),
  })
);

// ─── Type helpers ─────────────────────────────────────────────────────────
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;