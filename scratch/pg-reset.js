const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: 'postgresql://postgres:password@127.0.0.1:5435/ai_brand_growth?schema=public' });
  const res = await pool.query(`UPDATE "BrandDNAVersion" SET status = 'FAILED' WHERE status = 'GENERATING'`);
  console.log(`Reset ${res.rowCount} versions to FAILED.`);
  await pool.end();
}

main().catch(console.error);
