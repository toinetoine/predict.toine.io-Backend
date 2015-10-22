var express = require("express");
var app     = express();
var bodyParser = require("body-parser");
var YQL = require('yql');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/predict';

var schedule = require('node-schedule');

var db;
var mongoError;
mongoClient.connect(mongoUrl, function (error, database) { 
    db = database;
    mongoError = error;
    console.log("starting....");
    checkActivePredictions();
});

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));

/**
  * Every 5 minutes, record the price of all of the stocks in the objects table 
  * (stocks have the type: "stock").
  */
schedule.scheduleJob('0 */5 * * * *', function() {
    var symbols = ["MMM", "ABT", "ABBV", "ACN", "ACE", "ATVI", "ADBE", "ADT", "AAP", "AES", "AET", "AFL", "AMG", "A", "GAS", "APD", "ARG", "AKAM", "AA", "AGN", "ALXN", "ALLE", "ADS", "ALL", "GOOGL", "GOOG", "ALTR", "MO", "AMZN", "AEE", "AAL", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", "ADI", "AON", "APA", "AIV", "AAPL", "AMAT", "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", "AVGO", "AVB", "AVY", "BHI", "BLL", "BAC", "BK", "BCR", "BXLT", "BAX", "BBT", "BDX", "BBBY", "BRK-B", "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "BF-B", "CHRW", "CA", "CVC", "COG", "CAM", "CPB", "COF", "CAH", "HSIC", "KMX", "CCL", "CAT", "CBG", "CBS", "CELG", "CNP", "CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "XEC", "CINF", "CTAS", "CSCO", "C", "CTXS", "CLX", "CME", "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CPGX", "CMCSA", "CMCSK", "CMA", "CSC", "CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "CCI", "CSX", "CMI", "CVS", "DHI", "DHR", "DRI", "DVA", "DE", "DLPH", "DAL", "XRAY", "DVN", "DO", "DFS", "DISCA", "DISCK", "DG", "DLTR", "D", "DOV", "DOW", "DPS", "DTE", "DD", "DUK", "DNB", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMC", "EMR", "ENDP", "ESV", "ETR", "EOG", "EQT", "EFX", "EQIX", "EQR", "ESS", "EL", "ES", "EXC", "EXPE", "EXPD", "ESRX", "XOM", "FFIV", "FB", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", "FLR", "FMC", "FTI", "F", "FOSL", "BEN", "FCX", "FTR", "GME", "GPS", "GRMN", "GD", "GE", "GGP", "GIS", "GM", "GPC", "GNW", "GILD", "GS", "GT", "GWW", "HAL", "HBI", "HOG", "HAR", "HRS", "HIG", "HAS", "HCA", "HCP", "HP", "HES", "HPQ", "HD", "HON", "HRL", "HST", "HCBK", "HUM", "HBAN", "ITW", "IR", "INTC", "ICE", "IBM", "IP", "IPG", "IFF", "INTU", "ISRG", "IVZ", "IRM", "JEC", "JBHT", "JNJ", "JCI", "JPM", "JNPR", "KSU", "K", "KEY", "GMCR", "KMB", "KIM", "KMI", "KLAC", "KSS", "KHC", "KR", "LB", "LLL", "LH", "LRCX", "LM", "LEG", "LEN", "LVLT", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", "LOW", "LYB", "MTB", "MAC", "M", "MNK", "MRO", "MPC", "MAR", "MMC", "MLM", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", "MCK", "MJN", "WRK", "MDT", "MRK", "MET", "KORS", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", "MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NDAQ", "NOV", "NAVI", "NTAP", "NFLX", "NWL", "NFX", "NEM", "NWSA", "NWS", "NEE", "NLSN", "NKE", "NI", "NBL", "JWN", "NSC", "NTRS", "NOC", "NRG", "NUE", "NVDA", "ORLY", "OXY", "OMC", "OKE", "ORCL", "OI", "PCAR", "PH", "PDCO", "PAYX", "PYPL", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PFE", "PCG", "PM", "PSX", "PNW", "PXD", "PBI", "PCL", "PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PEG", "PSA", "PHM", "PVH", "QRVO", "PWR", "QCOM", "DGX", "RRC", "RTN", "O", "RHT", "REGN", "RF", "RSG", "RAI", "RHI", "ROK", "COL", "ROP", "ROST", "RCL", "R", "CRM", "SNDK", "SCG", "SLB", "SNI", "STX", "SEE", "SRE", "SHW", "SIAL", "SIG", "SPG", "SWKS", "SLG", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT", "STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", "TGNA", "THC", "TDC", "TSO", "TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", "TRIP", "FOXA", "FOX", "TSN", "TYC", "USB", "UA", "UNP", "UAL", "UNH", "UPS", "URI", "UTX", "UHS", "UNM", "URBN", "VFC", "VLO", "VAR", "VTR", "VRSN", "VRSK", "VZ", "VRTX", "VIAB", "V", "VNO", "VMC", "WMT", "WBA", "DIS", "WM", "WAT", "ANTM", "WFC", "HCN", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX", "XL", "XYL", "YHOO", "YUM", "ZBH", "ZION", "ZTS"];
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
  * Every 1 hour wipe all of the prices that are older than 25 hours
  * (every 0th minute)
  */
schedule.scheduleJob('* 0 * * * *', function() {
    // time now
    var twentyFiveHoursAgoTime = Math.floor((new Date).getTime() / 1000);
    // time 25 hours ago
    twentyFiveHoursAgoTime -= (25*60*60);
    if (!mongoError) {
        var objectsCollection = db.collection('objects');
        // remove all prices recorded before 25 hours ago.
        objectsCollection.deleteMany(
            {$match: { time: {$lte : twentyFiveHoursAgoTime} } },
            function (err, result) {}
        );
    }
});

/**
  * For each of the symbols, grab the current price and store it in the Values table
  */
var grabAndInsertNewStockValues = function (symbols) {
    var queryString = "select * from yahoo.finance.quote where symbol in ('" + symbols.join("','") + "') ";
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
                priceDocument.value = thisQuote.LastTradePriceOnly;
                priceDocument.time = currentTime;
                newPriceDocuments.push(priceDocument);
            }
            // insert the value in the values collection
            var valuesCollection = db.collection('values');
            valuesCollection.insert(newPriceDocuments, function (errValuesInsert, resultValuesInsert) {
                // remove all values from the recentValues collection that match symbols about to be inserted
                var recentValuesCollection = db.collection('recentValues');
                recentValuesCollection.deleteMany(
                    { $match: { object: { $in: symbols } } },
                    function (errRecentValuesRemove, resultRecentValuesRemove) {
                        // insert all of the new values in the recentValues collection (should replace all one's that were jsut removed)
                        recentValuesCollection.insert(newPriceDocuments, function (errRecentValuesInsert, resultRecentValuesInsert) { /* done! */ });
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
                            if (typeof (recentValues.object) != "undefined") {
                                symbolsIndicies[recentValues.object] = recentValueIndex;
                            }
                        }

                   
                        for (var predictionIndex = 0; predictionIndex < activePredictions.length; predictionIndex++) {
                            var thisPrediction = activePredictions[predictionIndex]
                            if (symbolsIndicies.hasOwnProperty(thisPrediction.object)) {
                                // grab this prediction's object's most recent value
                                var mostRecentValue = recentValues[symbolsIndicies[thisPrediction.object]];

                                // the object that will be used to update the prediction
                                // (assuming it's status has found to have changed from active)
                                var predictionUpdateObject = {};
                                predictionUpdateObject.$set = {};

                                // go through each of the possible cases that could cause prediction to fail
                                if (thisPrediction.action == "reach above" && mostRecentValue.value > thisPrediction.value) {
                                    predictionUpdateObject.$set.status = "true"
                                    predictionUpdateObject.$set.reason = "";
                                }
                                else if (thisPrediction.action == "sink below" && mostRecentValue.value < thisPrediction.value) {
                                    predictionUpdateObject.$set.status = "true"
                                    predictionUpdateObject.$set.reason = "";
                                }
                                else if (thisPrediction.action == "stay above" && mostRecentValue.value <= thisPrediction.value) {
                                    predictionUpdateObject.$set.status = "false"
                                    predictionUpdateObject.$set.reason = "";
                                }
                                else if (thisPrediction.action == "stay below" && mostRecentValue.value >= thisPrediction.value) {
                                    predictionUpdateObject.$set.status = "false"
                                    predictionUpdateObject.$set.reason = "";
                                }

                                // if the prediction is still found to be valid, then check if it lapsed (end time has passed)
                                if (predictionUpdateObject.$set.status == "active") {
                                    var currentTime = Math.floor(new Date().getTime() / 1000);
                                    if (thisPrediction.end <= currentTime) {
                                        // predicition was to stay above or below during the time interval 
                                        // (which it did because it statyed valid until the end time)
                                        if (thisPrediction.action == "stay above" || thisPrediction.action == "stay below") {
                                            predictionUpdateObject.$set.status = "true";
                                            predictionUpdateObject.$set.reason = "The price of " + thisPrediction.object + " ";
                                            predictionUpdateObject.$set += (thisPrediction.action == "stay above") ? "stayed above" : "stayed below";
                                            predictionUpdateObject.$set += " $" + thisPrediction.value.toString();
                                        }
                                            // predicition was to rise above/below a certain value (which it did NOT because the end time 
                                            // has been reached and the prediction status has still not been declared true)
                                        else {
                                            predictionUpdateObject.$set.status = "false";
                                            predictionUpdateObject.$set.reason = "The price of " + thisPrediction.object + " never ";
                                            predictionUpdateObject.$set.reason += (thisPrediction.action == "reach above") ? "rose above" : "sunk below";
                                            predictionUpdateObject.$set.reason += " $" + thisPrediction.value.toString();
                                        }
                                    }
                                }

                                // update the prediction if it's status was found to have changed from active
                                if (predictionUpdateObject.$set.status != "active") {
                                    db.collection('predictions').updateOne(
                                      { _id: thisPrediction._id },
                                      predictionUpdateObject,
                                      function (err, results) {});
                                }
                            }
                        }
                    }
                });
            }
        });
    }
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
