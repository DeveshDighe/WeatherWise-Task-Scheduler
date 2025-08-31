const route = require('express').Router();
const userRoutes = require('../routes/user/user.js');
const taskRoutes = require('../routes/tasks/tasks.js');
const { ipLimiter } = require('../middlewares/rateLimiter.js');

route.use('/user', userRoutes);
route.use('/tasks', ipLimiter, taskRoutes);

module.exports = route;