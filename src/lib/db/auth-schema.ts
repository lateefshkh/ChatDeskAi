// src/lib/db/auth-schema.ts
//
// Purpose: Better Auth tables (platform-level, RLS NOT applied).
//
// Why separate from schema.ts:
// - Auth tables are platform-level (users, sessions), not tenant-scoped.
// - RLS policies use `app.tenant_id` which doesn't apply to auth lookups.
// - Auth is always accessed via DATABASE_ADMIN_URL (owner connection).
//
// Tables:
// - users: email/password, emailVerified flag
// - sessions: active sessions with expiry
// - accounts: OAuth providers (future) + password hash for email/password
// - verifications: email verification + password reset tokens
//
// Ye kyun zaroori hai:
// - Better Auth ko expected table names/columns chahiye.
// - Separate file = clear boundary: auth tables (RLS bypass) vs tenant tables (RLS enforced).

import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────
// Better Auth core user table. Owner accounts for ChatDesk.
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("owner"), // 'owner' | 'platform_admin'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

// ─── Sessions ─────────────────────────────────────────────────────────────
// Active login sessions. httpOnly cookie references session token.
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("sessions_token_idx").on(table.token),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  })
);

// ─── Accounts ─────────────────────────────────────────────────────────────
// Password hash for email/password auth. OAuth providers add later.
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(), // 'credential' | 'google' | 'github'
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"), // hashed - Better Auth default (scrypt)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
  })
);

// ─── Verifications ────────────────────────────────────────────────────────
// Email verification tokens + password reset tokens.
// Single-use, hashed, 30 min expiry.
export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // email or user id
    value: text("value").notNull(), // hashed token
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index("verifications_identifier_idx").on(table.identifier),
  })
);

// ─── Types ────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;