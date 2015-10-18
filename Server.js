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
});

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));

/**
  * Every 1 minute, record the price of all of the stocks in the objects table 
  * (stocks have the type: "stock"). (every 0th second)
  */
schedule.scheduleJob('0 */2 * * * *', function() {
    var symbols = ["MMM", "ABT", "ABBV", "ACN", "ACE", "ATVI", "ADBE", "ADT", "AAP", "AES", "AET", "AFL", "AMG", "A", "GAS", "APD", "ARG", "AKAM", "AA", "AGN", "ALXN", "ALLE", "ADS", "ALL", "GOOGL", "GOOG", "ALTR", "MO", "AMZN", "AEE", "AAL", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", "ADI", "AON", "APA", "AIV", "AAPL", "AMAT", "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", "AVGO", "AVB", "AVY", "BHI", "BLL", "BAC", "BK", "BCR", "BXLT", "BAX", "BBT", "BDX", "BBBY", "BRK-B", "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "BF-B", "CHRW", "CA", "CVC", "COG", "CAM", "CPB", "COF", "CAH", "HSIC", "KMX", "CCL", "CAT", "CBG", "CBS", "CELG", "CNP", "CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "XEC", "CINF", "CTAS", "CSCO", "C", "CTXS", "CLX", "CME", "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CPGX", "CMCSA", "CMCSK", "CMA", "CSC", "CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "CCI", "CSX", "CMI", "CVS", "DHI", "DHR", "DRI", "DVA", "DE", "DLPH", "DAL", "XRAY", "DVN", "DO", "DFS", "DISCA", "DISCK", "DG", "DLTR", "D", "DOV", "DOW", "DPS", "DTE", "DD", "DUK", "DNB", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMC", "EMR", "ENDP", "ESV", "ETR", "EOG", "EQT", "EFX", "EQIX", "EQR", "ESS", "EL", "ES", "EXC", "EXPE", "EXPD", "ESRX", "XOM", "FFIV", "FB", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", "FLR", "FMC", "FTI", "F", "FOSL", "BEN", "FCX", "FTR", "GME", "GPS", "GRMN", "GD", "GE", "GGP", "GIS", "GM", "GPC", "GNW", "GILD", "GS", "GT", "GWW", "HAL", "HBI", "HOG", "HAR", "HRS", "HIG", "HAS", "HCA", "HCP", "HP", "HES", "HPQ", "HD", "HON", "HRL", "HST", "HCBK", "HUM", "HBAN", "ITW", "IR", "INTC", "ICE", "IBM", "IP", "IPG", "IFF", "INTU", "ISRG", "IVZ", "IRM", "JEC", "JBHT", "JNJ", "JCI", "JPM", "JNPR", "KSU", "K", "KEY", "GMCR", "KMB", "KIM", "KMI", "KLAC", "KSS", "KHC", "KR", "LB", "LLL", "LH", "LRCX", "LM", "LEG", "LEN", "LVLT", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", "LOW", "LYB", "MTB", "MAC", "M", "MNK", "MRO", "MPC", "MAR", "MMC", "MLM", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", "MCK", "MJN", "WRK", "MDT", "MRK", "MET", "KORS", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", "MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NDAQ", "NOV", "NAVI", "NTAP", "NFLX", "NWL", "NFX", "NEM", "NWSA", "NWS", "NEE", "NLSN", "NKE", "NI", "NBL", "JWN", "NSC", "NTRS", "NOC", "NRG", "NUE", "NVDA", "ORLY", "OXY", "OMC", "OKE", "ORCL", "OI", "PCAR", "PH", "PDCO", "PAYX", "PYPL", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PFE", "PCG", "PM", "PSX", "PNW", "PXD", "PBI", "PCL", "PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PEG", "PSA", "PHM", "PVH", "QRVO", "PWR", "QCOM", "DGX", "RRC", "RTN", "O", "RHT", "REGN", "RF", "RSG", "RAI", "RHI", "ROK", "COL", "ROP", "ROST", "RCL", "R", "CRM", "SNDK", "SCG", "SLB", "SNI", "STX", "SEE", "SRE", "SHW", "SIAL", "SIG", "SPG", "SWKS", "SLG", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT", "STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", "TGNA", "THC", "TDC", "TSO", "TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", "TRIP", "FOXA", "FOX", "TSN", "TYC", "USB", "UA", "UNP", "UAL", "UNH", "UPS", "URI", "UTX", "UHS", "UNM", "URBN", "VFC", "VLO", "VAR", "VTR", "VRSN", "VRSK", "VZ", "VRTX", "VIAB", "V", "VNO", "VMC", "WMT", "WBA", "DIS", "WM", "WAT", "ANTM", "WFC", "HCN", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX", "XL", "XYL", "YHOO", "YUM", "ZBH", "ZION", "ZTS"];
    for(var queryIndex = 0; queryIndex <= Math.floor((symbols.length-1)/20); queryIndex++) {
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
        }(symbols.slice(queryIndex * 20, (queryIndex + 1) * 20), queryIndex == Math.floor((symbols.length - 1) / 20)),
        queryIndex * 3000);
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

    queryYQL.exec(function (err, data) {
        if (!mongoError && data != null && data.hasOwnProperty("query") && data.query.hasOwnProperty("results")) {
            for (var resultIndex = 0; resultIndex < data.query.results.quote.length; resultIndex++) {
                var thisQuote = data.query.results.quote[resultIndex];
                var currentTime = Math.floor((new Date).getTime() / 60000) * 60;
                console.log("Grabbing: " + thisQuote);
                // insert the stock price into the values collection
                var valuesCollection = db.collection('values');
                valuesCollection.insertOne({
                    object: thisQuote.Symbol,
                    type: "stock",
                    value: thisQuote.LastTradePriceOnly,
                    time: currentTime
                }, function (err, result) { });
            }
        }
    });
}

/**
  * Check all of the active stock predictions and update their status if needed
  */
var checkActivePredictions = function () {

    if (!mongoError) {
        console.log("checking....");
        // the current epoch time
        var currentTime = Math.floor(new Date().getTime() / 1000);
        var predictionsCollection = db.collection('predictions');
        predictionsCollection.find({ type: "stock", status: "active" }).toArray(function (err, activePredictions) {
            // for each of the active predictions, check if they've been proven true, proven false, or still active
            console.log("Found: " + activePredictions.length + " active predictions.");
            for (var i = 0; i < activePredictions.length; i++) {
                var activePrediction = activePredictions[i];
                console.log(activePredictions[i]);
                // get all values with a time greater then the prediction's last_checked time
                // (or if the prediction doesn't have a last checked, then get all of the values 
                // with time greater than the predictions start time) and less than the predictions end time.
                var valuesFindObject = {};
                valuesFindObject.time = {};
                // lower bound for time of values to check prediction against
                if(activePrediction.hasOwnProperty("lastChecked")) {
                    valuesFindObject.time.$gte = activePrediction.lastChecked;
                }
                else {
                    valuesFindObject.time.$gte = activePrediction.start;
                }
                // upper bound for time of values to check prediction against
                valuesFindObject.time.$lte = activePrediction.end;
                valuesFindObject.type = "stock";
                var valuesCollection = db.collection('values');
                valuesCollection.find(valuesFindObject).toArray(function (err, newValues) {
                    // go through each of the possible cases that could cause prediction to fail
                    // predictionCheckResult stores the result of the checks
                    var predictionCheckResult = {};
                    predictionCheckResult.status = "active";
                    predictionCheckResult.reason = "";
                    for (var i = 0; i < newValues.length; i++) {
                        if(activePrediction.action == "reach above" && newValues[i].value > activePrediction.value) {
                            predictionCheckResult.status = "false"
                            predictionCheckResult.reason = "";
                        }
                        else if(activePrediction.action == "sink below" && newValues[i].value < activePrediction.value) {
                            predictionCheckResult.status = "false"
                            predictionCheckResult.reason = "";
                        }
                        else if(activePrediction.action == "stay above" && newValues[i].value <= activePrediction.value) {
                            predictionCheckResult.status = "false"
                            predictionCheckResult.reason = "";
                        }
                        else if(activePrediction.action == "stay below" && newValues[i].value >= activePrediction.value) {
                            predictionCheckResult.status = "false"
                            predictionCheckResult.reason = "";
                        }
                    }

                    // object for updating the prediction in mongo (used later)
                    var predictionUpdateObject = {};
                    predictionUpdateObject.$set = {};

                    // if the prediction was found to still be valid, then check if it lapsed (end time has passed)
                    if (predictionCheckResult.status == "active") {
                        
                        if (activePrediction.end <= currentTime) {
                            // predicition was to stay above or below during the time interval 
                            // (which it did because it statyed valid until the end time)
                            if (activePrediction.action == "stay above" || activePrediction.action == "stay below") {
                                predictionCheckResult.status = "true";
                                predictionCheckResult.reason = "The price of " + activePrediction.object + " ";
                                predictionCheckResult += (activePrediction.action == "stay above") ? "stayed above" : "stayed below";
                                predictionCheckResult += " $" + activePrediction.value.toString();
                            }
                            // predicition was to rise above/below a certain value (which it did NOT because the end time 
                            // has been reached and the prediction status has still not been declared true)
                            else {
                                predictionCheckResult.status = "false";
                                predictionCheckResult.reason = "The price of " + activePrediction.object + " never ";
                                predictionCheckResult += (activePrediction.action == "reach above") ? "rose above" : "sunk below";
                                predictionCheckResult += " $" + activePrediction.value.toString();
                            }
                        }
                    }

                    // the prediction status is no longer active, so will need to new status in the prediction update object
                    else 
                    {
                        predictionUpdateObject.$set.status = predictionCheckResult.status;
                        predictionUpdateObject.$set.reason = predictionCheckResult.reason;
                    }

                    
                    predictionUpdateObject.$set.checked = currentTime;


                    
                    if (predictionCheckResult.status != "active") {
                        db.collection('predictions').updateOne(
                          { _id: activePrediction._id },
                          predictionUpdateObject, 
                          function (err, results) {
                              console.log(results);
                          });
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
