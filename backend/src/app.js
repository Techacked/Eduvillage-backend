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

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet());
app.use(xssClean());
app.use(hpp());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});
app.use(limiter);

// CORS configuration for production
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'https://eduvillage-frontend123.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server tools, mobile clients, curl)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('✗ CORS blocked from origin:', origin, 'allowed:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use("/notify", require("./routes/notification.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/courses", require("./routes/course.routes"));
app.use("/enrollments", require("./routes/enrollment.routes"));


app.get("/", (req, res) => {
  res.send("EduVillage Backend API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Global error handler - ensures errors return JSON and stack in development
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({
    message: err && err.message ? err.message : 'Server error',
    error: err && err.message ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' && err && err.stack ? err.stack : undefined
  });
});

module.exports = app;
