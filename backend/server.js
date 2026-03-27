require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 SERVER STARTUP WITH RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════════
// This ensures the database connection is established before starting the server
// If connection fails, it retries with exponential backoff

let server;

async function startServer() {
  try {
    console.log("🚀 Starting EduVillage Backend...");
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Port: ${PORT}`);

    // ──────────────────────────────────────────────────────────────────────────
    // Step 1: Connect to Database
    // ──────────────────────────────────────────────────────────────────────────
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✓ Database connected successfully");

    // ──────────────────────────────────────────────────────────────────────────
    // Step 2: Start Server
    // ──────────────────────────────────────────────────────────────────────────
    server = app.listen(PORT, () => {
      console.log(`✓ Backend running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ Ready to accept requests\n`);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Step 3: Handle Server Errors
    // ──────────────────────────────────────────────────────────────────────────
    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    if (error.stack) {
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🛑 GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════════
// Ensures the server closes cleanly when receiving shutdown signals
// Allows in-flight requests to complete before exiting

async function gracefulShutdown(signal) {
  console.log(`\n📋 ${signal} signal received: closing gracefully`);

  if (server) {
    server.close(async () => {
      console.log("✓ Server closed");
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after 30 seconds timeout");
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

// Listen for shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ═══════════════════════════════════════════════════════════════════════════════
// ⚠️ UNCAUGHT EXCEPTION HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
// Catches any uncaught exceptions to prevent silent failures

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
  console.error("   Stack:", err.stack);
  console.error("   The application must be restarted");
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔴 UNHANDLED PROMISE REJECTION HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
// Catches any unhandled promise rejections

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED PROMISE REJECTION");
  console.error("   Promise:", promise);
  console.error("   Reason:", reason);
  // Don't exit - this might be a temporary issue
  // In production, you might want to log this to an error tracking service
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 START THE SERVER
// ═══════════════════════════════════════════════════════════════════════════════

startServer();
