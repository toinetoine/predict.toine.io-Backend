var express = require("express");
var app     = express();
var bodyParser = require("body-parser");
var YQL = require('yql');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/predict';

var schedule = require('node-schedule');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


// symbols in the S&P500
var symbols = ["MMM", "ABT", "ABBV", "ACN", "ACE", "ATVI", "ADBE", "ADT", "AAP", "AES", "AET", "AFL", "AMG", "A", "GAS", "APD", "ARG", "AKAM", "AA", "AGN", "ALXN", "ALLE", "ADS", "ALL", "GOOGL", "GOOG", "ALTR", "MO", "AMZN", "AEE", "AAL", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", "ADI", "AON", "APA", "AIV", "AAPL", "AMAT", "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", "AVGO", "AVB", "AVY", "BHI", "BLL", "BAC", "BK", "BCR", "BXLT", "BAX", "BBT", "BDX", "BBBY", "BRK-B", "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "BF-B", "CHRW", "CA", "CVC", "COG", "CAM", "CPB", "COF", "CAH", "HSIC", "KMX", "CCL", "CAT", "CBG", "CBS", "CELG", "CNP", "CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "XEC", "CINF", "CTAS", "CSCO", "C", "CTXS", "CLX", "CME", "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CPGX", "CMCSA", "CMCSK", "CMA", "CSC", "CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "CCI", "CSX", "CMI", "CVS", "DHI", "DHR", "DRI", "DVA", "DE", "DLPH", "DAL", "XRAY", "DVN", "DO", "DFS", "DISCA", "DISCK", "DG", "DLTR", "D", "DOV", "DOW", "DPS", "DTE", "DD", "DUK", "DNB", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMC", "EMR", "ENDP", "ESV", "ETR", "EOG", "EQT", "EFX", "EQIX", "EQR", "ESS", "EL", "ES", "EXC", "EXPE", "EXPD", "ESRX", "XOM", "FFIV", "FB", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", "FLR", "FMC", "FTI", "F", "FOSL", "BEN", "FCX", "FTR", "GME", "GPS", "GRMN", "GD", "GE", "GGP", "GIS", "GM", "GPC", "GNW", "GILD", "GS", "GT", "GWW", "HAL", "HBI", "HOG", "HAR", "HRS", "HIG", "HAS", "HCA", "HCP", "HP", "HES", "HPQ", "HD", "HON", "HRL", "HST", "HCBK", "HUM", "HBAN", "ITW", "IR", "INTC", "ICE", "IBM", "IP", "IPG", "IFF", "INTU", "ISRG", "IVZ", "IRM", "JEC", "JBHT", "JNJ", "JCI", "JPM", "JNPR", "KSU", "K", "KEY", "GMCR", "KMB", "KIM", "KMI", "KLAC", "KSS", "KHC", "KR", "LB", "LLL", "LH", "LRCX", "LM", "LEG", "LEN", "LVLT", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", "LOW", "LYB", "MTB", "MAC", "M", "MNK", "MRO", "MPC", "MAR", "MMC", "MLM", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", "MCK", "MJN", "WRK", "MDT", "MRK", "MET", "KORS", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", "MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NDAQ", "NOV", "NAVI", "NTAP", "NFLX", "NWL", "NFX", "NEM", "NWSA", "NWS", "NEE", "NLSN", "NKE", "NI", "NBL", "JWN", "NSC", "NTRS", "NOC", "NRG", "NUE", "NVDA", "ORLY", "OXY", "OMC", "OKE", "ORCL", "OI", "PCAR", "PH", "PDCO", "PAYX", "PYPL", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PFE", "PCG", "PM", "PSX", "PNW", "PXD", "PBI", "PCL", "PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PEG", "PSA", "PHM", "PVH", "QRVO", "PWR", "QCOM", "DGX", "RRC", "RTN", "O", "RHT", "REGN", "RF", "RSG", "RAI", "RHI", "ROK", "COL", "ROP", "ROST", "RCL", "R", "CRM", "SNDK", "SCG", "SLB", "SNI", "STX", "SEE", "SRE", "SHW", "SIAL", "SIG", "SPG", "SWKS", "SLG", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT", "STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", "TGNA", "THC", "TDC", "TSO", "TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", "TRIP", "FOXA", "FOX", "TSN", "TYC", "USB", "UA", "UNP", "UAL", "UNH", "UPS", "URI", "UTX", "UHS", "UNM", "URBN", "VFC", "VLO", "VAR", "VTR", "VRSN", "VRSK", "VZ", "VRTX", "VIAB", "V", "VNO", "VMC", "WMT", "WBA", "DIS", "WM", "WAT", "ANTM", "WFC", "HCN", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX", "XL", "XYL", "YHOO", "YUM", "ZBH", "ZION", "ZTS"];

var db;
var mongoError;
mongoClient.connect(mongoUrl, function (error, database) { 
    db = database;
    mongoError = error;
    console.log("starting....");
    checkActivePredictions();
});

/* Encryption tools */
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'q9A7Xgls';

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));

/**
  * Every 5 minutes, record the price of all of the stocks in the objects table 
  * (stocks have the type: "stock").
  */
schedule.scheduleJob('0 */5 * * * *', function() {
    for(var queryIndex = 0; queryIndex <= Math.floor((symbols.length-1)/100); queryIndex++) {
        // delay the query in order to create even distribution of queries over the entire minute period
        // (send a query every 2 seconds)
        setTimeout(function (symbolsToGrab, isLastSymbol) {
            return function () {
                // grab and insert into the values collection each of the new values for each of the symbols
                grabAndInsertNewStockValues(symbolsToGrab);
                // if on the last symbol, then check that all of the active predictions are still valid
                if (isLastSymbol) {
                    checkActivePredictions();
                }
            }
        }(symbols.slice(queryIndex * 100, (queryIndex + 1) * 100), queryIndex == Math.floor((symbols.length - 1) / 100)),
        queryIndex * 10000); // stagger find-and-store prices opertation each by 10 seconds
    }
});

/**
  * Grab the historical data for the day before every day at 12:13am
  * Every day at 12:13am record the day's high/low for each of the stocks in the historicalValues collection.
  */
schedule.scheduleJob('0 13 0 * * *', function () {
    // get the day, month, and year of yesterday
    var yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1); // get yesterday's date
    var yesterdayYear = yesterdayDate.getFullYear();
    var yesterdayMonth = yesterdayDate.getMonth();
    var yesterdayDay = yesterdayDate.getDate();
    // populate the historical data table in chunks of 100 stocks (every 10 seconds)
    for(var queryIndex = 0; queryIndex <= Math.floor((symbols.length-1)/100); queryIndex++) {
        // delay the query in order to create even distribution of queries over the entire minute period
        // (send a query every 2 seconds)
        setTimeout(function (symbolsToGrabHistoricalValuesFor, day, month, year) {
            return function () {
                getHistoricalData(symbolsToGrabHistoricalValuesFor, day, month, year);
            }
        }(symbols.slice(queryIndex * 100, (queryIndex + 1) * 100), yesterdayDay, yesterdayMonth, yesterdayYear),
        queryIndex * 10000); // stagger find-and-store prices opertation each by 10 seconds
    }
});

var getHistoricalData = function(symbolsToGet, day, monthIndex, year) {
    var monthNumber = monthIndex + 1; // human readable month number always monthIndex + 1 (1-12 not 0-11)
    var queryString = "select * from yahoo.finance.historicaldata where symbol in ('" + symbolsToGet.join("','") + "') and startDate = '" +
        year.toString() + "-" + monthNumber.toString() + "-" + day.toString() + "' and endDate = '" +
        year.toString() + "-" + monthNumber.toString() + "-" + day.toString() + "'";
    var queryYQL = new YQL(queryString);
    // execute the query to retreive the historical values from the day
    queryYQL.exec(function (err, data) {
        if (!mongoError && data != null && 
            data.hasOwnProperty("query") && 
            data.query.hasOwnProperty("results") && 
            data.query.results != null && 
            data.query.results.hasOwnProperty("quote") && 
            data.query.results.quote != null) {
            var newPriceDocuments = Array();
            for (var resultIndex = 0; resultIndex < data.query.results.quote.length; resultIndex++) {
                var thisQuote = data.query.results.quote[resultIndex];
                // create the value document to insert into the historicalValues collection
                var valueDocument = {};
                valueDocument.object = thisQuote.Symbol;
                valueDocument.type = "stock";
                // set the value doc's times
                valueDocument.year = year; //parseInt(thisQuote.Date.split("-")[0]);
                valueDocument.month = monthNumber; // parseInt(thisQuote.Date.split("-")[1]);
                valueDocument.day = day; //parseInt(thisQuote.Date.split("-")[2]);
                valueDocument.time = 
                    (new Date(year, monthIndex, day)).getTime()/1000;
                // set the value doc's values
                valueDocument.open = parseFloat(parseFloat(thisQuote.Open).toFixed(2));
                valueDocument.close = parseFloat(parseFloat(thisQuote.Close).toFixed(2));
                valueDocument.low = parseFloat(parseFloat(thisQuote.Low).toFixed(2));
                valueDocument.high = parseFloat((parseFloat(thisQuote.High).toFixed(2)));
                valueDocument.volume = parseInt(thisQuote.Volume);
                // add the new value document to the new price documents array
                newPriceDocuments.push(valueDocument);
            }

            // insert the new historical values into the historical values collection
            var historicalValuesCollection = db.collection('historicalValues');
            historicalValuesCollection.insert(newPriceDocuments, 
                function (errValuesInsert, resultValuesInsert) {
            });
        }
    });
};

/**
  * Every 1 hour on the 8th minute, wipe all of the prices that are older than 25 hours
  * (every 0th minute)
  */
schedule.scheduleJob('0 08 * * * *', function() {
    // time now
    var twentyFiveHoursAgoTime = Math.floor((new Date).getTime() / 1000);
    // time 25 hours ago
    twentyFiveHoursAgoTime -= (25*60*60);
    if (!mongoError) {
        var valuesCollection = db.collection('values');
        // remove all prices recorded before 25 hours ago.
        valuesCollection.deleteMany(
            { time: {$lte: twentyFiveHoursAgoTime} },
            function (err, result) { }
        );
    }
});

/**
  * For each of the symbols, grab the current price and store it in the Values table
  */
var grabAndInsertNewStockValues = function (symbolsToGet) {
    var queryString = "select * from yahoo.finance.quote where symbol in ('" + symbolsToGet.join("','") + "') ";
    var queryYQL = new YQL(queryString);
    // execute the query to retreive the prices
    queryYQL.exec(function (err, data) {
        if (!mongoError && data != null && data.hasOwnProperty("query") && data.query.hasOwnProperty("results")) {
            // documents to insert as values (one for each price received)
            var currentTime = Math.floor((new Date).getTime() / 60000) * 60;
            var newPriceDocuments = Array();
            for (var resultIndex = 0; resultIndex < data.query.results.quote.length; resultIndex++) {
                var thisQuote = data.query.results.quote[resultIndex];
                var priceDocument = {};
                priceDocument.object = thisQuote.Symbol;
                priceDocument.type = "stock";
                priceDocument.value = parseFloat(thisQuote.LastTradePriceOnly);
                priceDocument.time = currentTime;
                newPriceDocuments.push(priceDocument);
            }
            // insert the value in the values collection
            var valuesCollection = db.collection('values');
            valuesCollection.insert(newPriceDocuments, function (errValuesInsert, resultValuesInsert) {
                // remove all values from the recentValues collection that match symbols about to be inserted
                var recentValuesCollection = db.collection('recentValues');
                recentValuesCollection.deleteMany(
                    {object: {$in: symbolsToGet}},
                    function (errRecentValuesRemove, resultRecentValuesRemove) {
                        // insert all of the new values in the recentValues collection (should replace all one's that were jsut removed)
                        recentValuesCollection.insert(newPriceDocuments, 
                            function (errRecentValuesInsert, resultRecentValuesInsert) {
                        });
                    });
            });
        }
    });
}

/**
  * Check all of the active stock predictions and update their status if needed
  */
var checkActivePredictions = function () {

    if (!mongoError) {
        var predictionsCollection = db.collection('predictions');
        predictionsCollection.find({ type: "stock", status: "active" }).toArray(function (err, activePredictions) {
            if (typeof (activePredictions) != "undefined" && activePredictions != null) {
                // fetch all of the recent stock values from the recentValues collection
                var recentValuesFindObject = {};
                recentValuesFindObject.type = "stock";
                var recentValuesCollection = db.collection('recentValues');
                recentValuesCollection.find(recentValuesFindObject).toArray(function (errRecentValuesFind, recentValues) {
                    if (typeof (recentValues) != "undefined" && recentValues != null) {
                        // create an object that maps each stock name to its index in recentValues
                        var symbolsIndicies = {};
                        for (var recentValueIndex = 0; recentValueIndex < recentValues.length; recentValueIndex++) {
                            if (typeof (recentValues[recentValueIndex].object) != "undefined") {
                                symbolsIndicies[recentValues[recentValueIndex].object] = recentValueIndex;
                            }
                        }
                    
                        for (var predictionIndex = 0; predictionIndex < activePredictions.length; predictionIndex++) {
                            var thisPrediction = activePredictions[predictionIndex]
                            if (symbolsIndicies.hasOwnProperty(thisPrediction.object)) {
                                // grab this prediction's object's most recent value
                                var mostRecentValueDocument = recentValues[symbolsIndicies[thisPrediction.object]];

                                // the object that will be used to update the prediction
                                // (assuming it's status has found to have changed from active)
                                var predictionUpdateObject = {};
                                predictionUpdateObject.$set = {};

                                // if haven't reached the prediction end time yet, then check if it's still active
                                if(mostRecentValueDocument.time < thisPrediction.end) {
                                    // go through each of the possible cases that could cause prediction to fail
                                    if (thisPrediction.action == "reach above" && mostRecentValueDocument.value > thisPrediction.value) {
                                        predictionUpdateObject.$set.status = "true";
                                    }
                                    else if (thisPrediction.action == "sink below" && mostRecentValueDocument.value < thisPrediction.value) {
                                        predictionUpdateObject.$set.status = "true";
                                    }
                                    else if (thisPrediction.action == "stay above" && parseFloat(mostRecentValueDocument.value) <= thisPrediction.value) {
                                        predictionUpdateObject.$set.status = "false";
                                    }
                                    else if (thisPrediction.action == "stay below" && mostRecentValueDocument.value >= thisPrediction.value) {
                                        predictionUpdateObject.$set.status = "false";
                                    }

                                    // if the prediciton's status has been changed and it's no longer active, then create the reason message
                                    if(predictionUpdateObject.$set.hasOwnProperty("status") && predictionUpdateObject.$set.status != "active") {
                                        predictionUpdateObject.$set.reason = 
                                            getReasonMessage(thisPrediction, mostRecentValueDocument, predictionUpdateObject.$set.status == "true");
                                    }
                                }

                                // the prediction end time has been reached 
                                // (the object's value in the recentValues collection is past the end time of the prediction) 
                                // so check if it was true or failed
                                else {
                                    var currentTime = Math.floor(new Date().getTime() / 1000);
                                    if (thisPrediction.end <= currentTime) {
                                        // predicition was to stay above or below during the time interval 
                                        // (which it did because it statyed valid until the end time)
                                        if (thisPrediction.action == "stay above" || thisPrediction.action == "stay below") {
                                            predictionUpdateObject.$set.status = "true";
                                            predictionUpdateObject.$set.reason = 
                                                getReasonMessage(thisPrediction, mostRecentValueDocument, true);
                                        }
                                        // predicition was to rise above/below a certain value (which it did NOT because the end time 
                                        // has been reached and the prediction status has still not been declared true)
                                        else {
                                            predictionUpdateObject.$set.status = "false";
                                            predictionUpdateObject.$set.reason = 
                                                getReasonMessage(thisPrediction, mostRecentValueDocument, false);
                                        }
                                    }
                                }

                                // update the prediction if it's status was found to have changed from active
                                if (typeof(predictionUpdateObject.$set.status) != "undefined" && 
                                    predictionUpdateObject.$set.status != "active") {

                                    // update prediction in the predictions collection
                                    db.collection('predictions').updateOne(
                                      { _id: thisPrediction._id },
                                      predictionUpdateObject,
                                      function (err, results) {});

                                    // send email to the predictor informing 
                                    // them of the status change
                                    sendEmailToPredictor(decrypt(thisPrediction.predictor),
                                        predictionUpdateObject.$set.status,
                                        predictionUpdateObject.$set.reason,
                                        thisPrediction._id);
                                }
                            }
                        }
                    }
                });
            }
        });
    }
}

var sendEmailToPredictor = function(predictorEmail, predictionStatus, predictionReason, predictionId) {
    var smtpTransport = nodemailer.createTransport("SMTP",{
        host: "mail.gandi.net", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            user: "predict@toine.io",
            pass: "Money$$1993"
        }
    });

    var htmlEmail = "<div style='";
    if(predictionStatus == "true") {
        htmlEmail += "color: #53B981;";
    }
    else {
        htmlEmail += "color: red;";
    }
    htmlEmail += "'>";
    htmlEmail += "<h1>Your prediction turned out to be " + predictionStatus + ".</h1>";
    htmlEmail += "<br/>";
    htmlEmail += "<h3>" + predictionReason + " Check the prediction " +
        "<a href='http://predict.toine.io/prediction/" + predictionId.toString() + 
        "'>here</a>.</h3>";
    htmlEmail += "</div>";

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "Predict.toine.io ✔ <predict@toine.io>", // sender address
        to: predictorEmail, // list of receivers
        subject: "The result of your prediction is in... ", // Subject line
        text: "",
        html: htmlEmail
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error) {
            console.log(error);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
};

var getReasonMessage = function(predictionDocument, mostRecentValueDocument, isPredictionSuccessful) {
    var mostRecentValueDate = new Date(0);
    mostRecentValueDate.setSeconds(mostRecentValueDocument.time);

    var resonMessage = "The price of " + predictionDocument.object + " ";
    resonMessage += (isPredictionSuccessful) ? "did successfully " : "failed to ";
    resonMessage += predictionDocument.action + " $" + predictionDocument.value.toFixed(2).toString();
    resonMessage += " by the end time of the prediction. The price was last checked at ";
    resonMessage += getHumanReadableTime(mostRecentValueDate) + " on " + mostRecentValueDate.toLocaleDateString();
    resonMessage += " when it was $" + mostRecentValueDocument.value.toFixed(2).toString() + ".";

    return resonMessage;
}

var getHumanReadableTime = function(dateToGetTimeOf) {
    var hours = dateToGetTimeOf.getHours();
    var minutes = dateToGetTimeOf.getMinutes();
    var minutesString = (minutes < 10) ? "0" : "";
    minutesString += minutes.toString();
    var hoursString = ((hours % 12) > 0) ? (hours % 12).toString() : "12";
    var timePostfix = (hours < 12) ? "am" : "pm";
    return hoursString + ":" + minutesString + timePostfix;
}

/**
  * Create the tables for the S&P
  */
/*var initialRouter = express.Router();
app.use('/init', initialRouter);
initialRouter.use(function (req, res, next) {
    mongoClient.connect(mongoUrl, function (mongoError, db) {
        var objectsCollection = db.collection('objects');
        if (!mongoError) {
            var YQL = require('yql');
            var symbols = ["MMM", "ABT", "ABBV", "ACN", "ACE", "ATVI", "ADBE", "ADT", "AAP", "AES", "AET", "AFL", "AMG", "A", "GAS", "APD", "ARG", "AKAM", "AA", "AGN", "ALXN", "ALLE", "ADS", "ALL", "GOOGL", "GOOG", "ALTR", "MO", "AMZN", "AEE", "AAL", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", "ADI", "AON", "APA", "AIV", "AAPL", "AMAT", "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", "AVGO", "AVB", "AVY", "BHI", "BLL", "BAC", "BK", "BCR", "BXLT", "BAX", "BBT", "BDX", "BBBY", "BRK-B", "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "BF-B", "CHRW", "CA", "CVC", "COG", "CAM", "CPB", "COF", "CAH", "HSIC", "KMX", "CCL", "CAT", "CBG", "CBS", "CELG", "CNP", "CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "XEC", "CINF", "CTAS", "CSCO", "C", "CTXS", "CLX", "CME", "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CPGX", "CMCSA", "CMCSK", "CMA", "CSC", "CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "CCI", "CSX", "CMI", "CVS", "DHI", "DHR", "DRI", "DVA", "DE", "DLPH", "DAL", "XRAY", "DVN", "DO", "DFS", "DISCA", "DISCK", "DG", "DLTR", "D", "DOV", "DOW", "DPS", "DTE", "DD", "DUK", "DNB", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMC", "EMR", "ENDP", "ESV", "ETR", "EOG", "EQT", "EFX", "EQIX", "EQR", "ESS", "EL", "ES", "EXC", "EXPE", "EXPD", "ESRX", "XOM", "FFIV", "FB", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", "FLR", "FMC", "FTI", "F", "FOSL", "BEN", "FCX", "FTR", "GME", "GPS", "GRMN", "GD", "GE", "GGP", "GIS", "GM", "GPC", "GNW", "GILD", "GS", "GT", "GWW", "HAL", "HBI", "HOG", "HAR", "HRS", "HIG", "HAS", "HCA", "HCP", "HP", "HES", "HPQ", "HD", "HON", "HRL", "HST", "HCBK", "HUM", "HBAN", "ITW", "IR", "INTC", "ICE", "IBM", "IP", "IPG", "IFF", "INTU", "ISRG", "IVZ", "IRM", "JEC", "JBHT", "JNJ", "JCI", "JPM", "JNPR", "KSU", "K", "KEY", "GMCR", "KMB", "KIM", "KMI", "KLAC", "KSS", "KHC", "KR", "LB", "LLL", "LH", "LRCX", "LM", "LEG", "LEN", "LVLT", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", "LOW", "LYB", "MTB", "MAC", "M", "MNK", "MRO", "MPC", "MAR", "MMC", "MLM", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", "MCK", "MJN", "WRK", "MDT", "MRK", "MET", "KORS", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", "MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NDAQ", "NOV", "NAVI", "NTAP", "NFLX", "NWL", "NFX", "NEM", "NWSA", "NWS", "NEE", "NLSN", "NKE", "NI", "NBL", "JWN", "NSC", "NTRS", "NOC", "NRG", "NUE", "NVDA", "ORLY", "OXY", "OMC", "OKE", "ORCL", "OI", "PCAR", "PH", "PDCO", "PAYX", "PYPL", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PFE", "PCG", "PM", "PSX", "PNW", "PXD", "PBI", "PCL", "PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PEG", "PSA", "PHM", "PVH", "QRVO", "PWR", "QCOM", "DGX", "RRC", "RTN", "O", "RHT", "REGN", "RF", "RSG", "RAI", "RHI", "ROK", "COL", "ROP", "ROST", "RCL", "R", "CRM", "SNDK", "SCG", "SLB", "SNI", "STX", "SEE", "SRE", "SHW", "SIAL", "SIG", "SPG", "SWKS", "SLG", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT", "STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", "TGNA", "THC", "TDC", "TSO", "TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", "TRIP", "FOXA", "FOX", "TSN", "TYC", "USB", "UA", "UNP", "UAL", "UNH", "UPS", "URI", "UTX", "UHS", "UNM", "URBN", "VFC", "VLO", "VAR", "VTR", "VRSN", "VRSK", "VZ", "VRTX", "VIAB", "V", "VNO", "VMC", "WMT", "WBA", "DIS", "WM", "WAT", "ANTM", "WFC", "HCN", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX", "XL", "XYL", "YHOO", "YUM", "ZBH", "ZION", "ZTS"];
            for(var i = 0; i < symbols.length; i++) {
                var queryString = "select * from yahoo.finance.quote where symbol in ('" + symbols[i] + "') ";
                var queryYQL = new YQL(queryString);

                queryYQL.exec(function(err, data) {
                    objectsCollection.insertOne({
                        object: data.query.results.quote.Symbol,
                        type: "stock",
                        company: data.query.results.quote.Name
                    }, function (err, result) {});
                });
            }
        }
    });
});*/

app.listen(3090);