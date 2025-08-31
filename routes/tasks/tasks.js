const { createTask, getTasks, deleteTask, editTask, getTasksSummary, completeTask } = require('../../controller/tasks');
const auth = require('../../middlewares/auth');

const route = require('express').Router();


route.post('/create',auth, createTask);
route.get('/get/all',auth, getTasks);
route.put('/edit/:id',auth, editTask);
route.patch('/:id/complete',auth, completeTask);
route.delete('/delete/:id',auth, deleteTask);
route.get('/summary',auth, getTasksSummary);


module.exports = route;