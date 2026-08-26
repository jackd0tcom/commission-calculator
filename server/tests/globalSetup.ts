import pg from "pg";

const TEST_DB = "commissions-db-test";
const TEST_URL = `postgresql:///${TEST_DB}`;

export default async function globalSetup() {
  process.env.DATABASE_URL = TEST_URL;
  process.env.NODE_ENV = "test";
  process.env.RESPONA_WEBHOOK_SECRET ??= "test-webhook-secret";

  const client = new pg.Client({ database: "postgres" });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [TEST_DB],
    );
    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${TEST_DB}"`);
    }
  } finally {
    await client.end();
  }

  const { db } = await import("../model.ts");
  await db.sync({ force: true });
  await db.close();
}
