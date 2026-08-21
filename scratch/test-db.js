const { Client } = require('pg');

async function test() {
  const connectionString = 'postgresql://postgres:password@127.0.0.1:5432/postgres';
  console.log('Connecting to:', connectionString);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('SUCCESS: Connected to postgres database!');
    const res = await client.query('SELECT datname FROM pg_database;');
    console.log('Databases:', res.rows.map(r => r.datname));
  } catch (err) {
    console.error('FAILED to connect:', err.message);
  } finally {
    await client.end();
  }
}

test();
