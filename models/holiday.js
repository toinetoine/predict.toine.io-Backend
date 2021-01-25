var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Holiday = new Schema({
  name: String,
  dateString: String,
  date: Date
}, {timestamps: true});

// ensure don't store duplicate
Holiday.index({name: 1, dateString: 1}, {unique: true});

module.exports = mongoose.model('Holiday', Holiday);