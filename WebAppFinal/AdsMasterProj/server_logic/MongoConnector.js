var mongoModule = require('mongodb');
var mongoClient = mongoModule.MongoClient;
var mongoDb;
var dbName = 'adsServer';

//************
//  Low level connevtions
//************
exports.connect = function(successCallback) {
    mongoClient.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err;

        mongoDb = db;
        console.log("Connected to MongoDB");
        successCallback();
    });
};

exports.disconnect = function() {
    mongoDb.close();
};

//************
//  Basic Collection retrival
//************
function getAdsCollection() {
    return mongoDb.db(dbName).collection('ads');
}

function getDisplaysCollection() {
    return mongoDb.db(dbName).collection('displays');
}

//************
//  Full data retrival
//************
exports.getAllAds = function(dataCallback) {
    getAdsCollection().find({}).toArray(function(err, docs) {
        if (err) throw err;
        dataCallback(docs);
    });
};

exports.loadAllDisplays = function(dataCallback) {
    getDisplaysCollection().find({}).toArray(function(err, docs) {
        if (err) throw err;

        dataCallback(docs);
    });
};

//************
//  Ads by station
//************
exports.getAdsByStationId = function(stationId, dataCallback) {
    getAdsCollection().find({"stationId" : {$eq:stationId}}).toArray(function(err, docs) {
        if (err) throw err;

        dataCallback(docs);
    });
};


//************
//  Ads CRUD operations
//************
exports.createAd = function(adData, endCallback) {
    getAdsCollection().insert(adData, function(err, result) {
        if (err) throw err;

        endCallback(true);
    });
};

exports.deleteAd = function(adId, endCallback) {
    console.log("trying to delete an ad , id: " + adId);
    getAdsCollection().remove({ _id : new mongoModule.ObjectID(adId) }, function(err, result) {
        console.log("Db result is : " + JSON.stringify(result));
        if (err) throw err;

        var success = (result == 1);
        endCallback(success);
    });
};

exports.editAd = function(adId, adData, endCallback) {
    getAdsCollection().update({ _id : new mongoModule.ObjectID(adId)}, { $set: adData }, function(err, result) {
        if (err) throw err;
        var success = (result == 1);
        endCallback(success);
    });
};

exports.getOwnersData = function(dataCallback) {
    getAdsCollection().group(
        { owner: 1 },                               // GroupBy Key
        {},                                         // Condition
        { moneyInvested : 0, count: 0 },            // Initial value
        function( curr, result ) {                  // Reduce function
            result.moneyInvested += parseInt(curr.moneyInvested);
            result.count++;
        },
        function(err, results) {                    // End callback
            if (err) throw err;
            console.log(results);
            dataCallback(results);
        }
    );
};