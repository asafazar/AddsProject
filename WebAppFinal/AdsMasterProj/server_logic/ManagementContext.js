var mongoConn = require('./MongoConnector.js');

exports.getManagementData = function(dataCallback) {
    mongoConn.getAllAds(dataCallback);
};

exports.createAd = function(adData, endCallback) {
    mongoConn.createAd(adData, endCallback);
};

exports.deleteAd = function(adId, endCallback) {
    mongoConn.deleteAd(adId, endCallback);
};

exports.editAd = function(adId, adData, endCallback) {
    mongoConn.editAd(adId, adData, endCallback);
};

exports.loadAllDisplays = function(dataCallback) {
    mongoConn.loadAllDisplays(dataCallback);
};

exports.validateAd = function(ad,alerts){

    var valid = true;
    console.log('Ad is : ' + JSON.stringify(ad));
    // Ensure basic data is not empty
    if (ad.name ==""){
        valid = false;
        alerts.push("Ad name cannot be empty");
    }
    if (ad.stationId == ""){
        valid = false;
        alerts.push("Ad must be linked to station");
    }
    if (ad.owner ==""){
        valid = false;
        alerts.push("Owner name cannot be empty");
    }
    if (ad.fields ==""){
        valid = false;
        alerts.push("Ad field cannot be empty");
    }
    if (ad.moneyInvested ==""){
        valid = false;
        alerts.push("Invested money cannot be empty");
    }
    if ((ad.moneyInvested < 100) || (ad.moneyInvested > 5000)){
        valid = false;
        alerts.push("Invested money needs to be between 100 and 5000");
    }

    // Check dates
    if (ad.timeFrame.startDate ==""){
        valid = false;
        alerts.push("Start date cannot be empty");
    }
    if (ad.timeFrame.endDate ==""){
        valid = false;
        alerts.push("End date cannot be empty");
    }
    if (new Date(ad.timeFrame.startDate) > new Date(ad.timeFrame.endDate)){
        valid = false;
        alerts.push("End date cannot be after start date");
    }

    return valid;
}