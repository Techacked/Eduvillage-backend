const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const cookieToken = req.cookies && req.cookies.auth_token;
    const token = bearerToken || cookieToken;

    if (!token) {
      console.warn('No auth token provided; auth header:', req.headers.authorization, 'cookies:', req.cookies);
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('Auth middleware error:', err && err.stack ? err.stack : err);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
