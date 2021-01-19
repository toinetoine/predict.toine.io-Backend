var express = require("express");
const app = express();
const config = require('config');
const assert = require('assert');
const dateFormat = require("dateformat");
const got = require('got');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const chalk = require('chalk');
const cheerio = require('cheerio');
const request = require('request');

let Ticker = require('./models/ticker');
let Range = require('./models/range');

var mongoClient;
const mongoConfig = config.get('mongo');
const polygonConfig = config.get('polygon');

console.log('Running with configuration: ', config);

mongoose.connect(mongoConfig.url + '/' + mongoConfig.db, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}, function(error) {
    if (error) {
        console.log(error);
    }
});

['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {
    if (mongoClient) {
        mongoClient.close();
    }
    process.exit();
  }));

var grabTickerData = async function(ticker, dateString, callback) {
    let url = '';
    try {
        url += polygonConfig.endpoints.yesterday;
        url = url.replace('{ticker}', ticker);
        url = url.replace('{date}', dateString);
        url = url.replace('{date}', dateString);
        url += url.includes('?') ? '&apiKey=' : '?apiKey=';
        url += polygonConfig.apiKey;
    } catch(error) {
        callback(error, null);
    }

    const result = await got(url).json();
    callback(null, result, url);
}

/* Every Sunday at 12am grab list of S&P tickers from wikipedia */
schedule.scheduleJob('0 0 0 * * 7', function() {
    request({
        method: 'GET',
        url: 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    }, (err, res, body) => {
        if (err) return console.error(err);
        let $ = cheerio.load(body);
        var dataFieldKeys = [];
        var colHeaders = $('table[id="constituents"] > tbody > tr > th');
        for (var i = 0; i < colHeaders.length; i++) {
            var td = colHeaders[i].childNodes[0];
            if (td.childNodes) {
                dataFieldKeys.push(td.childNodes[0].data.trim());
            } else {
                dataFieldKeys.push(td.data.trim());
            }
        }

        var companies = [];
        var domTableRows = $('table[id="constituents"] > tbody > tr');
        var domTableRows = domTableRows.toArray().filter(row => {
            for (var i = 0; i < row.children.length; i++) {
                if (row.children[i].name == 'th') {
                    return false;
                }
            }
            return true;
        });

        rowsLoop:
        for (var rowI = 0; rowI < domTableRows.length; rowI++) {
            var domRowTds = domTableRows[rowI].children.filter(row => row.type == 'tag');
            if (domRowTds.length != dataFieldKeys.length) {
                console.log('Mismatch number of cols with this row\'s number of cols' + domTableRows.innerHTML);
                continue;
            }

            var company = {};
            // populate company object with this row
            for (var colI = 0; colI < domRowTds.length; colI++) {
                if (domRowTds[colI].firstChild != null) {
                    if (domRowTds[colI].firstChild.type == 'text') {
                        company[dataFieldKeys[colI]] = domRowTds[colI].firstChild.data.trim();
                    } else if (domRowTds[colI].firstChild.name == 'a') {
                        company[dataFieldKeys[colI]] = domRowTds[colI].firstChild.firstChild.data.trim()
                    } else {
                        console.warn('Giving up on row: ' + chalk.blue(cheerio.html(domTableRows[rowI])));
                        continue rowsLoop; // give up on this row
                    }
                }
            }
            companies.push(company);
        }

        for (var i = 0; i < companies.length; i++) {
            let query = {};
            let update = {raw: companies[i]};
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            Ticker.findOneAndUpdate(query, update, options, function(err, ticker) {
                if (err) {
                    console.warn(chalk.red('Error creating ticker for: '), update.raw,
                        '\n', chalk.red('Error: '), err);
                }
            });
        }
    });
});


/* Tues-Sat at 1:03am (day after weekday) record grab the high/lows from previous day */
schedule.scheduleJob('0 3 1 * * 2-6', function() {
    Ticker.find({}, function(err, tickers) {
        if (err) {
            console.error('Error getting tickers from mongo: \n', err);
        } else {
            let _yesterday = new Date();
            _yesterday.setDate(_yesterday.getDate() - 1);
            let yesterdayDateString = dateFormat(_yesterday, "yyyy-mm-dd");
            for (let i = 0; i < tickers.length; i++) {
                setTimeout(function() {
                    grabTickerData(tickers[i].symbol, yesterdayDateString, function(err, body, rawQuery = null) {
                        let queryErrorMessage = chalk.red('Error: (Query: ') + rawQuery + chalk.red(')');
                        if (err) {
                            console.log(queryErrorMessage, '/n', err);
                        } else {
                            if (body.resultsCount > 0) {
                                if (body.resultsCount > 1) {
                                    console.warn(chalk.yellow('Unexpectedly received '), resultsCount,
                                    chalk.yellow(' results for single day query (will use the first): '), '\n', body);
                                }
            
                                let result = body.results[0];
                                let date = new Date(result.t);
            
                                assert.strictEqual(yesterdayDateString, dateFormat(date, "yyyy-mm-dd"));
    
                                Range.create({
                                    ticker: tickers[i], 
                                    dateString: yesterdayDateString,
                                    date: date,
                                    low: result.l,
                                    high: result.h
                                }, function(err, range) {
                                    if (err) {
                                        console.error(queryErrorMessage, ' (getting creating range): \n', err);
                                    } else {
                                        console.log('Created price range: ', range);
                                    }
                                }); 
                            } else {
                                console.error(chalk.red('Error: No result for query: \n'), rawQuery);
                            }
                        }
                    });
                }, i * 60000 / polygonConfig.rateLimit);
            }
        }
    });
});

app.listen(3090);