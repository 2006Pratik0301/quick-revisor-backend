const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database to test connection on startup
require("./config/database");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/questions", questionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Quick Revisor API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// When running locally (node src/server.js) start the HTTP server.
// When deploying on Vercel, Vercel will import this module and use the exported
// `app` as the request handler, so we must not call `listen()` on import.
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error(`\nTo fix this, you can:`);
      console.error(`  1. Kill the process using port ${PORT}:`);
      console.error(`     lsof -ti:${PORT} | xargs kill -9`);
      console.error(
        `  2. Or use a different port by setting PORT in your .env file`
      );
      console.error(`     PORT=5001`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });
}

// Export the Express app so serverless platforms (Vercel) can use it.
module.exports = app;
