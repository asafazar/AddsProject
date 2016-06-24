var socketModule = angular.module('socketModule', []);

/**
 Factory to wrap the logic of "socketIo".
 Current design is that the controller needs to delete all listeners that it has
 used once its scope is destroyed.
 **/
socketModule.factory('socket', function ($rootScope) {

    var serverSocket = io.connect('http://localhost:8080');


    return {
        /*
         * Basic socket API
         */
        on : function (eventName, callBack){
            serverSocket.on(eventName, function (){
                var args = arguments;
                $rootScope.$apply(function (){
                    callBack.apply(serverSocket,args);
                });
            });
        },
        emit : function(eventName, data, callBack){
            serverSocket.emit(eventName, data, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    if (callBack) {
                        callBack.apply(serverSocket,args);
                    }
                });
            });
        },
        removeAllListeners: function (eventName, callBack) {
            serverSocket.removeAllListeners(eventName);
        }

    };
});

/* The bridge for the application and the server.
 */
socketModule.factory('serverApi', function ($rootScope, socket) {
    return {
        //*********************
        // Listeners
        //*********************
        registerListener : function(eventName, callBack){
            socket.on(eventName,callBack);
        },

        clearEventsListeners : function(eventName, callBack){
            socket.removeAllListeners(eventName, callBack);
        },

        //*********************
        // Defined server API
        //*********************
        emit_GetActiveAdsData : function(){
            socket.emit('GetAds',{getAll : false});
        },

        emit_GetAllAdsData : function(){
            socket.emit('GetAds',{getAll : true});
        },

        emit_GetActiveAdsByStation : function(stationId){
            socket.emit('GetAdsByStation',{'stationId' : stationId});
        },

        emit_GetItunesData : function(searchTerm) {
            socket.emit('GetItunesData', {'term' : searchTerm});
        },

        emit_GetAllDisplays : function () {
            socket.emit('LoadAllDisplays');
        },

        emit_AdCreate : function (ad) {
            socket.emit('CreateAd',{adData : ad});
        },
        emit_AdUpdate : function (_id, ad) {
            socket.emit('EditAd', {adId : _id.toString() ,adData : ad});
        },
        emit_AdDelete : function (id) {
            socket.emit('DeleteAd',{adId : id.toString()});
        },

        emit_getOwnersData: function () {
            socket.emit('GetOwnersData',{});
        },

        emit_validateAd : function(_ad){
            socket.emit('ValidateAd',{ad : _ad});
        },

        //****************************
        // Defined events from server (To keep track of constants)
        //****************************
        serverEvent_ActiveAdsDataResponse 	: "ActiveAdsResponse",
        serverEvent_ActiveAdsByStationRes   : "ActiveAdsByStationResponse",
        serverEvent_AllAdsDataResponse 		: "AllAdsResponse",
        serverEvent_AddCreatedEvent 		: "AdCreated",
        serverEvent_AddUpdatedEvent 		: "AdUpdated",
        serverEvent_AddDeletedEvent 		: "AdDeleted",
        serverEvent_ItunesResponse 			: "ItunesResponse",
        serverEvent_AllDisplaysResponse 	: "DisplaysData",
        serverEvent_OwnersDataResponse 		: "OwnersData",
        serverEvent_AdValidation 			: "AdValidationResponse"
    };
});