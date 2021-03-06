var mongoConn = require('./MongoDAO.js');
var io;
var ContextTypes = {
    DISPLAY 	: "display",
    MANAGEMENT 	: "management",
    STATISTICS 	: "statistics"
};
var displayCtx = require('./DisplayContext');
var adsCtx = require('./AdsContext');
var statisticsCtx = require('./StatisticsContext');
var restHandler = require('./RestHandler');

exports = module.exports = startServer;

function startServer(server) {
    io = require('socket.io')(server);

    mongoConn.connect(function() {
        setSocketIoConnectionListener();
    });
}

function setSocketIoConnectionListener() {
    // Prepare client listeners for new connection
    io.on('connection', function (client) {
        setSocketIoListeners(client);
    });
}

function setSocketIoListeners(client) {
    /*
     Data.getAll : True - returns all ads , False - return only the active ones.
     */
    client.on('GetAds',function(data){
        if (typeof data.getAll === 'undefined') return;
        logEvent('GetActiveAds', data);
        onGetAds(client, data.getAll);
    });

    client.on('GetAdsByStation',function(data){
        if (typeof data.stationId === 'undefined') return;
        logEvent('GetActiveAdsByStation', data);
        onGetAdsByStation(client, data.stationId);
    });

    client.on('ValidateAd', function(data) {
        console.log("Validating ad");
        if (typeof data.ad === 'undefined') return;
        logEvent('ValidateAd', data);
        onValidateAd(client, data.ad);
    });

    client.on('CreateAd', function(data) {
        if (typeof data.adData === 'undefined') return;
        logEvent('CreateAd', data);
        onCreateAd(data.adData);
    });

    client.on('DeleteAd', function(data) {
        if (typeof data.adId === 'undefined') return;
        logEvent('DeleteAd', data);
        console.log("Delete Ad with id " + data.adId);
        onDeleteAd(client , data.adId);
    });

    client.on('EditAd', function(data) {
        if (typeof data.adId === 'undefined') return;
        if (typeof data.adData === 'undefined') return;
        logEvent('EditAd', data);
        onEditAd(data.adId, data.adData);
    });

    client.on('LoadAllDisplays', function(data) {
        logEvent('LoadAllDisplays', data);
        onLoadAllDisplays(client);
    });

    //  Itunes API
    client.on('GetItunesData',function(data){
        if (typeof data.term === 'undefined') return;
        logEvent('GetItunesData', data);
        onGetItunesData(client,data.term);
    });

    client.on('GetOwnersData', function(data) {
        onGetOwnersData(client);
    });
}

//**************************
// Event handling functions
//**************************
function onGetAds(client, getAll){
    if (getAll){
        adsCtx.getManagementData(function(data) {
            console.log('Emiting All Ads response, Data : ');
            console.log(JSON.stringify(data));
            client.emit('AllAdsResponse', {allAds : data});
        });
    } else {
        displayCtx.getDisplayData(function(data) {
            console.log('Emiting Active Ads response ');
            client.emit('ActiveAdsResponse', {activeAds : data});
        });
    }
}

function onGetAdsByStation(client, stationId){
    displayCtx.getDisplayDataByStation(stationId, function(data) {
        console.log('Emiting ActiveAds by station response ');
        client.emit('ActiveAdsByStationResponse', {activeAds : data});
    });
}

/*
 Validates that the add is logically good.
 */
function onValidateAd (client, ad){
    var _alerts = [];
    if (adsCtx.validateAd(ad, _alerts)){
        console.log("Ad is valid");
        client.emit('AdValidationResponse',{valid:  true});

    }else {
        console.log("Ad is not valid");
        client.emit('AdValidationResponse',{valid:  false , alerts : _alerts});
    }
}

function onCreateAd(adData) {
    adsCtx.createAd(adData, function(success) {
        if (success) {
            console.log("Emiting Ad create");
            io.sockets.emit('AdCreated');
        }
        else {
            console.log("Could not create the ad");
        }
    });
}

function onDeleteAd(client, adId) {
    adsCtx.deleteAd(adId, function(success) {
        if (success) {
            console.log("Ad deleted successfully well");
            io.sockets.emit('AdDeleted',{id : adId});
        }
        else {
            console.log("Could not delete ad : " + adId);
        }
    });
}

function onEditAd(adId, adData) {
    adsCtx.editAd(adId, adData, function(success) {
        if (success) {
            console.log("Emiting Ad update");
            io.sockets.emit('AdUpdated',{id : adId});
        }
        else {
            console.log("Could not update ad : " + adId);
        }
    });
}

function onLoadAllDisplays(client) {
    adsCtx.loadAllDisplays(function(data) {
        console.log('Emiting Displays Data response, Data : ');
        console.log(JSON.stringify(data));
        client.emit("DisplaysData", data);
    });
}


function onGetItunesData(client, searchTerm){
    var pHost = 'itunes.apple.com';
    var pEndpoint = '/search';
    var pMethod = 'GET';
    var pData = {
        term : searchTerm
    };

    var pSuccess = function(result){
        console.log('Emiting itunes response');
        client.emit("ItunesResponse",{items : result.results});
    };

    restHandler.performRestRequest(pHost,pEndpoint,
        pMethod,pData,pSuccess);
}

function onGetOwnersData(client) {
    statisticsCtx.getOwnersData(function(data) {
        client.emit("OwnersData", data);
    });
}

function refreshAllClientsData(contextType) {
    switch (contextType) {
        case ContextTypes.DISPLAY:
            sendDisplayData(null);
            break;
        case ContextTypes.MANAGEMENT:
            sendManagementData(null);
            break;
        case ContextTypes.STATISTICS:
            sendStatisticsData(null);
            break;
        default:
            break;
    }
}

function refreshClientData(client, contextType) {
    switch(contextType) {
        case ContextTypes.DISPLAY:
            sendDisplayData(client);
            break;
        case ContextTypes.MANAGEMENT:
            sendManagementData(client);
            break;
        case ContextTypes.STATISTICS:
            sendStatisticsData(client);
            break;
        default:
            break;
    }
}

// Sends all clients or specific client display context data
function sendDisplayData(specificClient) {
    if (specificClient === null) {
        io.in(ContextTypes.DISPLAY).sockets.forEach(function (socket) {
            displayCtx.getDisplayData(socket.displayId, function(data) {
                socket.emit('AdsData', data);
            });
        });
    }
    else {
        displayCtx.getDisplayData(specificClient.displayId, function(data) {
            specificClient.emit('AdsData', data);
        });
    }
}

// Sends all clients or specific client management context data
function sendManagementData(specificClient) {
    adsCtx.getManagementData(function(data) {
        if (specificClient === null) {
            io.to(ContextTypes.MANAGEMENT).emit('ManagementData', data);
        }
        else {
            specificClient.emit('ManagementData', data);
        }
    });
}

function logEvent(eventName, eventData){
    console.log("Event received. Event name : " + eventName + " , Data : " + JSON.stringify(eventData));
}
