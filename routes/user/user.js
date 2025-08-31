const { registerUser, getUser, loginUser } = require('../../controller/user');
const auth = require('../../middlewares/auth');

const route = require('express').Router();


route.post('/register', registerUser);
route.post('/login', loginUser);
route.get('/', auth, getUser);


module.exports = route;