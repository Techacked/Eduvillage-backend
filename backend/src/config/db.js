const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 DATABASE CONNECTION WITH RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════════
// This function connects to MongoDB with automatic retry on failure
// It's production-grade and handles network issues gracefully

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    // Validate environment variable
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is not set. Check your .env file."
      );
    }

    console.log("🔌 Attempting to connect to MongoDB...");

    // ────────────────────────────────────────────────────────────────────────
    // Connection Options:
    // - serverSelectionTimeoutMS: How long to wait before timing out
    // - socketTimeoutMS: How long a socket can be inactive
    // - retryWrites: Automatically retry writes on transient errors
    // - maxPoolSize: Maximum number of sockets
    // ────────────────────────────────────────────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for initial connection
      socketTimeoutMS: 45000, // 45 second timeout for socket operations
      retryWrites: true, // Automatically retry writes
      w: "majority", // Wait for majority of replicas before confirming write
      maxPoolSize: 10, // Maximum connections in pool
      minPoolSize: 2, // Minimum connections in pool
    });

    console.log("✓ MongoDB connected successfully");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);

    // ────────────────────────────────────────────────────────────────────────
    // Connection Event Listeners for monitoring
    // ────────────────────────────────────────────────────────────────────────
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected - attempting to reconnect...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✓ MongoDB reconnected");
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed:`, error.message);

    // ────────────────────────────────────────────────────────────────────────
    // Retry Logic: If this fails, try again after a delay
    // ────────────────────────────────────────────────────────────────────────
    if (retries > 0) {
      console.log(
        `⏳ Retrying connection in ${delay / 1000} seconds... (${retries} attempts left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    } else {
      console.error(
        "❌ Could not connect to MongoDB after multiple attempts. Exiting."
      );
      process.exit(1);
    }
  }
};

module.exports = connectDB;
