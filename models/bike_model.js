const mongoose = require('mongoose');
const db = require('../config/db');
const stationModel = require('./station_model'); // Assuming you have a station model 
const { Schema } = mongoose;

const bikeSchema = new Schema({
    status: {
        type: String,
        enum: ['locked', 'unlocked', 'maintenance','ontrip',],
        default: 'locked'
    },

    isInDock: {
        type: Boolean,
        default: true
      },
    station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: stationModel.modelName, // This should match the name in your `station_model.js`
        default: null
    },
    battery_level: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    last_service_date: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

bikeSchema.pre('save', function (next) {
  if (!this.isInDock) {
    this.station_id = null;
  }
  next();
});

bikeSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.isInDock === false || update.$set?.isInDock === false) {
      this.set({ station_id: null });
    }
    next();
  });

module.exports = mongoose.model('Bike',bikeSchema)

