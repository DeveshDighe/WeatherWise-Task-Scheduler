const { rateLimit } = require('express-rate-limit');

const ipLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  limit: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      status: "error",
      message: "Too many requests"
    });
  }
});

module.exports = {
    ipLimiter
}