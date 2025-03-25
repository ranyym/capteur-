 
const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  waterLevel: Number,
  vibration: Number,
  flame: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
