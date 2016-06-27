var mongoConn = require('./MongoDAO.js');

exports.getDisplayData = function(dataCallback) {
    var relevantAdsToDisplay = [];

    mongoConn.getAllAds(function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesValid(ad.timeFrame)) {
                relevantAdsToDisplay.push(ad);
            }
        });

        dataCallback(relevantAdsToDisplay);
    });
};

exports.getDisplayDataByStation = function(stationId, dataCallback) {
    var relevantAdsByStations = [];

    mongoConn.getAdsByStationId(stationId, function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesValid(ad.timeFrame)) {
                relevantAdsByStations.push(ad);
            }
        });

        dataCallback(relevantAdsByStations);
    });
};

function isTimeFramesValid(displayTimeFrame) {
    var today = new Date();
    var validFrame;

    var startDate = new Date(displayTimeFrame.startDate);
    var endDate = new Date(displayTimeFrame.endDate);

    validFrame = ((startDate < today) && (endDate > today));

    console.log();
    console.log("Current ad dates are : " + displayTimeFrame.startDate  + " - " + displayTimeFrame.endDate + ". IsValidDate : " + validFrame);
    console.log("Date objects are : " + startDate + " -- " + endDate);

    return validFrame;
}
