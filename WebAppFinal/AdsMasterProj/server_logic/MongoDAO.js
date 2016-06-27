var mongoModule = require('mongodb');
var mongoClient = mongoModule.MongoClient;
var mongoDB;
var dbName = 'adsServer';

exports.connect = function(successCallback) {
    mongoClient.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err;

        mongoDB = db;
        console.log("Successfully Connected to MongoDB");
        successCallback();
    });
};

exports.disconnect = function() {
    mongoDB.close();
};

function getAdsCollection() {
    return mongoDB.db(dbName).collection('ads');
}

function getDisplaysCollection() {
    return mongoDB.db(dbName).collection('displays');
}

exports.getAllAds = function(dataCallback) {
    getAdsCollection().find({}).toArray(function(err, docs) {
        if (err) throw err;
        dataCallback(docs);
    });
};

exports.createAd = function(adData, endCallback) {
    getAdsCollection().insert(adData, function(err, result) {
        if (err) throw err;

        endCallback(true);
    });
};

exports.editAd = function(adId, adData, endCallback) {
    getAdsCollection().update({ _id : new mongoModule.ObjectID(adId)}, { $set: adData }, function(err, result) {
        if (err) throw err;
        var success = (result == 1);
        endCallback(success);
    });
};

exports.deleteAd = function(adId, endCallback) {
    console.log("start deleting an ad. Ad id: " + adId);
    getAdsCollection().remove({ _id : new mongoModule.ObjectID(adId) }, function(err, result) {
        console.log("Db result is : " + JSON.stringify(result));
        if (err) throw err;

        var success = (result == 1);
        endCallback(success);
    });
};

exports.getAdsByStationId = function(stationId, dataCallback) {
    getAdsCollection().find({"stationId" : {$eq:stationId}}).toArray(function(err, docs) {
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

// Groupp by. key - owner, condition - none, (moneyInvested, count) - initial values, function - reduce function
exports.getOwnersData = function(dataCallback) {
    getAdsCollection().group(
        { owner: 1 },
        {},
        { moneyInvested : 0, count: 0 },
        function( curr, result ) {
            result.moneyInvested += parseInt(curr.moneyInvested);
            result.count++;
        },
        function(err, results) {
            if (err) throw err;
            console.log(results);
            dataCallback(results);
        }
    );
};