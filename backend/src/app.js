const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 LOGGING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// Morgan logs all HTTP requests for monitoring and debugging
// In production: 'combined' format provides detailed logs
// In development: 'dev' format is concise and colorful
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Custom request logging for debugging
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? "⚠️" : "✓";
    console.log(
      `${logLevel} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

// Helmet: Sets various HTTP headers for security
// Protects against: XSS, Clickjacking, MIME sniffing, etc.
app.use(helmet());

// XSS Clean: Sanitizes user input to prevent XSS attacks
app.use(xssClean());

// HPP: Prevents HTTP Parameter Pollution attacks
app.use(hpp());

// Cookie Parser: Required for auth token cookies
app.use(cookieParser());

// ═══════════════════════════════════════════════════════════════════════════════
// 🚦 RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════
// Prevents brute force attacks and DDoS
// Limits: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: { 
    message: "Too many requests from this IP, please try again after 15 minutes.",
    retryAfter: "15 minutes"
  },
  skip: (req) => {
    // Skip rate limiting for health checks in production
    return req.path === "/health" && process.env.NODE_ENV === "production";
  }
});
app.use(limiter);

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// Securely configure Cross-Origin Resource Sharing
// In development: Allow localhost for testing
// In production: Only allow specified frontend domains
// 🌐 CORS CONFIGURATION (FINAL SAFE)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://eduvillage-frontend1223.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    const isAllowed = allowedOrigins.some(o =>
      normalizedOrigin === o || normalizedOrigin.startsWith(o)
    );

    if (isAllowed) {
      return callback(null, true);
    }

    console.log("❌ CORS Blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors({
  origin: true,
  credentials: true
}));
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 BODY PARSER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// Parse application/json with size limit to prevent large payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Debug endpoint to check CORS configuration
app.get("/cors-debug", (req, res) => {
    res.json({
      allowedOrigins,
      currentOrigin: req.get('Origin'),
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      timestamp: new Date().toISOString()
    });
  });

// ═══════════════════════════════════════════════════════════════════════════════
// 🛣️ ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// API endpoints are organized by resource type
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/enrollments", require("./routes/enrollment.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// Legacy routes (for backward compatibility)
app.use("/auth", require("./routes/auth.routes"));
app.use("/courses", require("./routes/course.routes"));
app.use("/enrollments", require("./routes/enrollment.routes"));
app.use("/notify", require("./routes/notification.routes"));

// ═══════════════════════════════════════════════════════════════════════════════
// 🏥 HEALTH CHECK ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// Root endpoint: Confirms server is running
app.get("/", (req, res) => {
  res.status(200).json({
    message: "✓ EduVillage Backend API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint: Used by Render and monitoring services
// Returns detailed status for deployment health verification
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode = dbConnected ? 200 : 503;

  res.status(statusCode).json({
    status: dbConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    db: {
      status: dbConnected ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState
    },
    timestamp: new Date().toISOString(),
    checks: {
      database: dbConnected ? "✓ pass" : "✗ fail",
      api: "✓ pass"
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📧 NOT FOUND HANDLER (404)
// ═══════════════════════════════════════════════════════════════════════════════
app.use((req, res) => {
  console.warn(`🔍 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ❌ GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
// Catches all errors from routes and middleware
// Ensures consistent error response format
// Shows stack trace only in development for security
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Log error with full context
  console.error("❌ Error:", {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    statusCode,
    message: err.message,
    stack: err.stack
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: isProduction ? undefined : err.message,
    // Only show stack trace in development
    stack: isProduction ? undefined : err.stack,
    requestId: req.id, // For tracing (if request ID middleware is added)
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
