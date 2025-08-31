const bcrypt = require('bcrypt');
const User = require('../model/user.js');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, city } = req.body;

    const requiredFields = ['name', 'email', 'password', 'city'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `${missingFields.join(", ")} ${missingFields.length > 1 ? 'fields' : 'field'} required`
      });
    }

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      city
    });

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN, { expiresIn: "1h" });

    res.status(201).json({
      status: 'success',
      message: 'User Registered',
      data: user,
      token
    });
  } catch (error) {
    next(error);
  }
};


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: "error", message: "user does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Invalid password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN, { expiresIn: "1h" });

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    registerUser,
    loginUser,
    getUser
}