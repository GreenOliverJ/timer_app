const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  description: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
