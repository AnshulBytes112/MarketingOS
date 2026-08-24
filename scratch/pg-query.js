const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: 'postgresql://postgres:password@127.0.0.1:5435/ai_brand_growth?schema=public' });
  const res = await pool.query(`SELECT id, status, version FROM "BrandDNAVersion"`);
  console.log('Versions:', res.rows);
  const brands = await pool.query(`SELECT id, "onboardingStatus" FROM "Brand"`);
  console.log('Brands:', brands.rows);
  await pool.end();
}

main().catch(console.error);
