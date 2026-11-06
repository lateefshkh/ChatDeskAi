-- drizzle/0001_rls_setup.sql
--
-- RLS (Row Level Security) setup for ChatDesk.
--
-- Yeh migration manually chalti hai kyunki Drizzle Kit RLS policies
-- generate nahi karta. Isko `npm run db:migrate` ke baad manually
-- chalayein, ya migration runner mein alag script ke through.
--
-- Design:
-- - app_user role ke liye RLS enabled (owner role bypass karta hai, isliye nahi).
-- - Har tenant table pe policy: tenant_id = current_setting('app.tenant_id').
-- - Agar app.tenant_id set nahi hai to policy DENY ho jati hai (NULL comparison).
-- - `WITH CHECK` insert/update pe bhi enforce karta hai.
--
-- Ye kyun zaroori hai:
-- - Application-layer bug (galat tenantId) bhi DB-level pe block ho jata hai.
-- - Defense in depth: agar route handler mein bug ho, data leak nahi hoga.
-- - DPDP/GDPR compliance: tenant data cross-access impossible.

-- ─── 1. RLS enable karein (app_user only, owner bypass karta hai) ─────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: webhook_events pe RLS nahi (platform-level, sirf admin access).

-- ─── 2. Policies: app_user sirf apna tenant dekhe/edits kare ─────────────
-- Har table pe: USING = read filter, WITH CHECK = write filter.
-- current_setting('app.tenant_id', true) - true = missing ho to NULL return (deny).

CREATE POLICY tenant_isolation_tenants ON tenants
  FOR ALL TO app_user
  USING (id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_sources ON sources
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_chunks ON chunks
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_conversations ON conversations
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_messages ON messages
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_leads ON leads
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_payments ON payments
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- audit_logs: tenant_id nullable hai (tenant delete ke baad null ho sakta hai).
-- Policy: tenant_id null wale rows sirf admin dekhe (app_user ko dikhega nahi).
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ─── 3. app_user ko tables pe privileges ─────────────────────────────────
-- RLS policies enforce karne ke liye bhi base privileges chahiye.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ─── 4. Future tables pe bhi default privileges ──────────────────────────
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;