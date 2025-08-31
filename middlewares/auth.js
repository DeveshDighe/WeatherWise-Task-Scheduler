const jwt = require('jsonwebtoken');
const User = require('../model/user.js');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    req.user = user; 
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
};

module.exports = auth;
