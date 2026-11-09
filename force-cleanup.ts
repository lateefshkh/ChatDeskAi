import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_ADMIN_URL });

async function main() {
  try {
    const ADMIN_EMAIL = 'slatif200426@gmail.com';
    
    // 1. Admin user aur uske tenant ka ID nikaalein
    const adminRes = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    const adminId = adminRes.rows[0]?.id;
    if (!adminId) { console.error('Admin not found'); process.exit(1); }

    const adminTenantRes = await pool.query('SELECT id FROM tenants WHERE owner_user_id = $1', [adminId]);
    const adminTenantId = adminTenantRes.rows[0]?.id;
    if (!adminTenantId) { console.error('Admin tenant not found'); process.exit(1); }

    console.log('Admin Tenant ID:', adminTenantId);

    // 2. Child tables se orphan data delete karein
    const steps = [
      ['messages', 'DELETE FROM messages WHERE tenant_id != $1'],
      ['conversations', 'DELETE FROM conversations WHERE tenant_id != $1'],
      ['leads', 'DELETE FROM leads WHERE tenant_id != $1'],
      ['chunks', 'DELETE FROM chunks WHERE tenant_id != $1'],
      ['sources', 'DELETE FROM sources WHERE tenant_id != $1'],
      ['payments', 'DELETE FROM payments WHERE tenant_id != $1'],
      ['audit_logs', 'DELETE FROM audit_logs WHERE tenant_id IS NOT NULL AND tenant_id != $1'],
    ];

    for (const [name, sql] of steps) {
      const result = await pool.query(sql, [adminTenantId]);
      console.log(`✅ ${name} deleted:`, result.rowCount);
    }

    // 3. Orphan sessions/accounts/verifications delete karein
    await pool.query('DELETE FROM sessions WHERE user_id != $1', [adminId]);
    await pool.query('DELETE FROM accounts WHERE user_id != $1', [adminId]);
    const verRes = await pool.query('DELETE FROM verifications WHERE identifier NOT IN (SELECT email FROM users)');
    console.log(`✅ verifications deleted:`, verRes.rowCount);

    // 4. Final check
    const check = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM tenants) as tenants,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM conversations) as conversations,
        (SELECT COUNT(*) FROM chunks) as chunks,
        (SELECT COUNT(*) FROM sources) as sources
    `);
    console.log('\nFinal counts:');
    console.table(check.rows);

    console.log('✅ Cleanup complete!');
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
