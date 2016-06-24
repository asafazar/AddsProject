var mongoConn = require('./MongoConnector.js');

exports.getOwnersData = function(dataCallback) {
    mongoConn.getOwnersData(dataCallback);
};
