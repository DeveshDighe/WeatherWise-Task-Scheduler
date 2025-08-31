// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
   },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  isOutdoor: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending'
   },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date,
    default: null 
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
