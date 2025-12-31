const { Pool } = require("pg");

// The code below supports two database configuration styles:
// 1) A single connection string via DATABASE_URL or NEON_DATABASE_URL (recommended for Neon)
// 2) Individual SUPABASE_* env vars (legacy Supabase setup)

const connectionString =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || null;

let pool;
let usingConnectionString = false;

if (connectionString) {
  usingConnectionString = true;
  console.log(
    "🔗 Using database connection string from DATABASE_URL / NEON_DATABASE_URL"
  );
  // Use connection string (Neon or other Postgres providers)
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Pool tuning
    max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    allowExitOnIdle: false,
  });
} else {
  // Fallback to Supabase-style individual env vars
  const requiredEnvVars = [
    "SUPABASE_DB_HOST",
    "SUPABASE_DB_USER",
    "SUPABASE_DB_PASSWORD",
    "SUPABASE_DB_NAME",
    "SUPABASE_DB_PORT",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missingVars.join(", ")
    );
    console.error(
      "Please check your .env file and ensure the database credentials are set."
    );
  }

  const dbPort = parseInt(process.env.SUPABASE_DB_PORT, 10) || 5432;
  const isPooler = dbPort === 6543;

  const poolConfig = {
    host: process.env.SUPABASE_DB_HOST,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    port: dbPort,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: isPooler ? 30000 : 20000,
    idleTimeoutMillis: 30000,
    max: isPooler ? 10 : 10,
    min: 0,
    allowExitOnIdle: false,
  };

  if (isPooler) {
    console.log("🔗 Using Supabase Connection Pooler (Transaction mode)");
    console.log(`   Host: ${poolConfig.host}`);
    console.log(`   Port: ${poolConfig.port}`);
  } else {
    console.log("🔗 Using Direct Supabase Connection");
    console.log(`   Host: ${poolConfig.host}`);
    console.log(`   Port: ${poolConfig.port}`);
    console.log("   ⚠️  Note: Direct connection may require IP whitelisting");
  }

  pool = new Pool(poolConfig);
}

// Improved error handling for pool connections
pool.on("error", (err, client) => {
  console.error("❌ Unexpected error on idle client", err);
  if (client) {
    client.end();
  }
});

pool.on("connect", (client) => {
  // console.log("✅ New client connected to database");
});

pool.on("remove", (client) => {
  // console.log("🔌 Client removed from pool");
});

async function queryWithRetry(text, params, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      const isConnectionError =
        msg.includes("connection terminated") ||
        msg.includes("timeout") ||
        msg.includes("connection closed") ||
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNREFUSED" ||
        err.code === "ECONNRESET" ||
        err.code === "57P01";

      if (isConnectionError && i < retries) {
        const delay = Math.min(1000 * Math.pow(2, i), 5000);
        console.warn(
          `⚠️  Connection error, retrying query (${
            i + 1
          }/${retries}) after ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }
}

module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;

// Test connection on startup with retry logic
let retryCount = 0;
const maxRetries = 3;
const retryDelay = 2000; // 2 seconds

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    if (usingConnectionString) {
      console.log(
        "✅ Successfully connected using DATABASE_URL/NEON_DATABASE_URL"
      );
    } else {
      console.log("✅ Successfully connected to Supabase database");
    }
    console.log(`   Database time: ${res.rows[0].now}`);
  } catch (err) {
    retryCount++;

    console.error("❌ Failed to connect to database:");
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code || "N/A"}`);

    const isTimeoutError =
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNREFUSED" ||
      err.code === "ECONNRESET" ||
      (err.message || "").toLowerCase().includes("timeout") ||
      (err.message || "").toLowerCase().includes("connection terminated") ||
      (err.message || "").toLowerCase().includes("connection closed");

    if (isTimeoutError && retryCount < maxRetries) {
      console.error(
        `\n   🔄 Retrying connection (${retryCount}/${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return testConnection();
    }

    // Helpful tips depending on environment
    if (connectionString) {
      console.error(
        "\n🔧 Check your DATABASE_URL / NEON_DATABASE_URL and ensure it is correct and includes SSL settings (e.g. sslmode=require or provide SSL in client)."
      );
      console.error(
        "      Example: postgres://<user>:<password>@<host>:5432/<db>?sslmode=require"
      );
    } else {
      console.error(
        "\n🔧 Check your Supabase settings: ensure host, port, user, password are correct and your IP is allowed if using direct connection."
      );
      console.error(
        "      Consider using Connection Pooler (port 6543) to avoid IP allowlist requirements."
      );
    }

    // Don't exit - allow app to start and handle errors gracefully
  }
}

// Test connection asynchronously (non-blocking)
testConnection();
