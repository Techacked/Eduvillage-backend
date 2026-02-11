require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
})();
