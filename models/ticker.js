var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const chalk = require('chalk');

var Ticker = new Schema({
  symbol: String,
  name: String,
  sector: String,
  headquarters: String,
  dateAdded: Date,
  cik: String,
  raw: Schema.Types.Mixed
}, {timestamps: true});

const KEY_ALIASES = {
  'symbol': {optional: false, aliases: ['Ticker']},
  'name': {optional: false, aliases: ['Security']},
  'sector': {optional: true, aliases: ['Industry', 'GICS', 'GICS Sub-Industry']},
  'headquarters': {optional: true, aliases: ['hq', 'location', 'Headquarters Location']},
  'dateAdded': {optional: true, aliases: ['Date First Added']},
  'cik': {optional: false, aliases: ['Central Index Key']}
}

function sanitizeCompany(rawCompany) {
  var company = {};
  for (let [name, aliases] of Object.entries(KEY_ALIASES)) {
    let isOptional = false;
    if (aliases.optional === true) {
      isOptional = true;
    }
    
    let aliasesLowerCase = aliases.aliases.map(alias => alias.toLowerCase());
    let value = null;
    for (const [rawKey, rawValue] of Object.entries(rawCompany)) {
      if (rawKey.toLocaleLowerCase() == name || aliasesLowerCase.includes(rawKey.toLocaleLowerCase())) {
        value = rawValue;
        break;
      }
    }
    if (value) {
      company[name] = value;
    } else if (!isOptional) {
      throw ('Unable to find \'' + name + '\' for: \n' + JSON.stringify(rawCompany))
    }
  }
  return company;
}

Ticker.pre('findOneAndUpdate', function(next) {
  let company = sanitizeCompany(this._update.raw);
  this._conditions.symbol = company['symbol'];
  for (const [key, value] of Object.entries(company)) {
    this._update[key] = value;
  }

  next();
});

Ticker.pre('save', function (next) {
  let company = sanitizeCompany(this.raw);
  for (const [key, value] of Object.entries(company)) {
    this[key] = value;
  }

  next();
});

module.exports = mongoose.model('Ticker', Ticker);