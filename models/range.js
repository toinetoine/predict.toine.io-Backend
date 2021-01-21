var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const chalk = require('chalk');

let Ticker = require('../models/ticker');

var Range = new Schema({
  ticker: { type: Schema.Types.ObjectId, ref: 'Ticker' },
  dateString: String, // calendar date "yyyy-mm-dd"
  date: Date, // raw date object
  low: Number,
  high: Number,
  open: Number,
  close: Number,
  volume: Number,
  volumeWeightedPrice: Number  
}, {timestamps: true});

// enforce only 1 Range for each ticker each day
Range.index({calendarDate: 1, ticker: 1}, {unique: true});

module.exports = mongoose.model('Range', Range);