const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'https://eduvillage-frontend123.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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
