// src/lib/db/with-tenant.ts
import { Pool, type PoolClient } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

const adminPool = new Pool({
  connectionString: env.DATABASE_ADMIN_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export type TenantDb = NeonDatabase<typeof schema>;

export async function withTenant<T>(
  tenantId: string,
  fn: (tx: TenantDb) => Promise<T>
): Promise<T> {
  if (
    typeof tenantId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)
  ) {
    throw new Error("withTenant: tenantId must be a valid UUID");
  }

  const client: PoolClient = await adminPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL ROLE app_user");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);

    const db = drizzle({ client, schema });
    const result = await fn(db);

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function closeAdminPool(): Promise<void> {
  await adminPool.end();
}