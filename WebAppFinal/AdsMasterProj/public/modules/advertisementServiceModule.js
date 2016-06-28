var advertisementsModule = angular.module('advertisementsModule',['socketModule']);

advertisementsModule.service('adsService',function(serverApi){
    this.activeAds = [];
    this.allAds = [];
    this.num = 0;
    this.allStations = [];

    //*******************
    //	Relevant socket listeners
    //*******************
    serverApi.registerListener(serverApi.serverEvent_ActiveAdsDataResponse, function (data) {
        this.activeAds = data.activeAds;
        console.log("Active ads amount : " + data.activeAds.length);
    }.bind(this));

    serverApi.registerListener(serverApi.serverEvent_ActiveAdsByStationRes, function (data) {
        this.activeAds = data.activeAds;
        console.log("Active ads amount : " + data.activeAds.length);
    }.bind(this));

    serverApi.registerListener(serverApi.serverEvent_AllAdsDataResponse, function (data) {
        this.allAds = data.allAds;
        this.num = data.allAds.length;
    }.bind(this));

    serverApi.registerListener(serverApi.serverEvent_AddCreatedEvent, function (data) {
        console.log("Got created ad event");
        refreshAllAds();
    });

    serverApi.registerListener(serverApi.serverEvent_AddUpdatedEvent, function (data) {
        console.log("Got updated ad event");
        refreshAllAds();
    });

    serverApi.registerListener(serverApi.serverEvent_AddDeletedEvent, function (data) {
        console.log("Got deleted ad event");
        refreshAllAds();
    });

    serverApi.registerListener(serverApi.serverEvent_AllDisplaysResponse, function (data) {
        this.allStations = data;
    }.bind(this));

    function refreshActiveAds(){
        serverApi.emit_GetActiveAdsData();
    }
    function refreshActiveAdsByStation(stationId){
        serverApi.emit_GetActiveAdsByStation(stationId);
    }
    function refreshAllAds(){
        serverApi.emit_GetAllAdsData();
    }

    function refreshAllAds(){
        refreshActiveAds();
        refreshAllAds();
    }

    function getAdById(id){
        var ad = undefined;
        var i;

        for (i = 0; i < this.allAds.length; ++i) {
            if(this.allAds[i]._id === id){
                return this.allAds[i];
            }
        }

        return ad;
    }

    this.getAdById = getAdById;
    this.refreshActive = refreshActiveAds;
    this.refreshActiveByStation = refreshActiveAdsByStation;
});