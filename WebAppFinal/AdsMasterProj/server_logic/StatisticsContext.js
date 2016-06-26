var mongoDao = require('./MongoDAO.js');

exports.getOwnersData = function(dataCallback) {
    mongoDao.getOwnersData(dataCallback);
};
