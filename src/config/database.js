const { Pool } = require("pg");

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_DB_HOST",
  "SUPABASE_DB_USER",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_DB_NAME",
  "SUPABASE_DB_PORT",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", ")
  );
  console.error(
    "Please check your .env file and ensure all Supabase database credentials are set."
  );
}

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  port: parseInt(process.env.SUPABASE_DB_PORT, 10) || 5432,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000,
  max: 20, // Maximum number of clients in the pool
});

// Test the connection
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Test connection on startup
pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("✅ Successfully connected to Supabase database");
    console.log(`   Database time: ${res.rows[0].now}`);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Supabase database:");
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code || 'N/A'}`);
    
    // Check for timeout errors by code or message
    const isTimeoutError = 
      err.code === 'ETIMEDOUT' || 
      err.code === 'ECONNREFUSED' ||
      err.message?.toLowerCase().includes('timeout') ||
      err.message?.toLowerCase().includes('connection terminated');
    
    if (err.code === 'ENOTFOUND') {
      console.error("\n🔧 Hostname not found. The pooler hostname might be incorrect.");
      console.error("   Try using the direct connection instead:");
      console.error("   SUPABASE_DB_HOST=db.strmdmijjuvolidhuupw.supabase.co");
      console.error("   SUPABASE_DB_PORT=5432");
      console.error("   Then add your IP to Supabase allowlist in Dashboard > Settings > Database");
    } else if (isTimeoutError) {
      console.error("\n🔧 Connection timeout detected. Try these solutions:");
      console.error("\n   1. ⚡ USE CONNECTION POOLER (Recommended - No IP whitelist needed):");
      console.error("      Get the correct pooler hostname from:");
      console.error("      Supabase Dashboard > Settings > Database > Connection Pooling");
      console.error("      Look for 'Transaction' or 'Session' mode connection string");
      console.error("\n   2. 📍 Add your IP to Supabase allowlist:");
      console.error("      - Go to Supabase Dashboard > Settings > Database");
      console.error("      - Find 'Connection Pooling' or 'Allowed IPs' section");
      console.error("      - Add your current IP or enable 'Allow all IPs'");
      console.error("\n   3. 🔍 Verify your connection settings:");
      console.error(`      Host: ${process.env.SUPABASE_DB_HOST || '❌ NOT SET'}`);
      console.error(`      Port: ${process.env.SUPABASE_DB_PORT || '❌ NOT SET'}`);
      console.error(`      Database: ${process.env.SUPABASE_DB_NAME || '❌ NOT SET'}`);
      console.error(`      User: ${process.env.SUPABASE_DB_USER || '❌ NOT SET'}`);
      console.error("\n   4. ⏸️  Check if your Supabase project is paused:");
      console.error("      - Free tier projects pause after inactivity");
      console.error("      - Go to Supabase Dashboard and wake it up");
      console.error("\n   5. 🌐 Network/Firewall issues:");
      console.error("      - Check if your firewall is blocking port 5432 or 6543");
      console.error("      - Try from a different network to rule out ISP blocking");
    } else {
      console.error("\nPlease check:");
      console.error("   1. Your .env file has all required variables");
      console.error("   2. Your Supabase database is running");
      console.error("   3. Your connection credentials are correct");
      console.error("   4. Your IP is allowed in Supabase connection settings");
    }
  });

module.exports = pool;
