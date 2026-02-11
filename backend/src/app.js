const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use("/api/notify", require("./routes/notification.routes"));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/enrollments", require("./routes/enrollment.routes"));


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
