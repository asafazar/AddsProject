var mongoConn = require('./MongoConnector.js');

exports.getDisplayData = function(dataCallback) {
    var relevantDisplayAds = [];

    // Gets all ads per display id and filter them according to ad's configured time frames
    mongoConn.getAllAds(function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesValid(ad.timeFrame)) {
                relevantDisplayAds.push(ad);
            }
        });

        dataCallback(relevantDisplayAds);
    });
};

exports.getDisplayDataByStation = function(stationId, dataCallback) {
    var relevantDisplayAds = [];

    // Gets all ads per station id and filter them according to ad's configured time frames
    mongoConn.getAdsByStationId(stationId, function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesValid(ad.timeFrame)) {
                relevantDisplayAds.push(ad);
            }
        });

        dataCallback(relevantDisplayAds);
    });
};

// Checks if one of the ad's time frame match current time
function isTimeFramesValid(displayTimeFrame) {
    var today = new Date();
    var validFrame;

    // Check current date between start & end dates
    var startDate = new Date(displayTimeFrame.startDate);
    var endDate = new Date(displayTimeFrame.endDate);

    validFrame = ((startDate < today) && (endDate > today));

    console.log();
    console.log("Current ad dates are : " + displayTimeFrame.startDate  + " - " + displayTimeFrame.endDate + " IsValid : " + validFrame);
    console.log("Date objects are : " + startDate + " -- " + endDate);


    return validFrame;

}
