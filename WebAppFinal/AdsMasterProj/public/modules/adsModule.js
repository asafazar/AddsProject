var adsModule = angular.module('adsModule',['socketModule']);

adsModule.service('adsService',function(serverApi){
    this.activeAds = [];
    this.allAds = [];
    this.num = 0;
    this.allStations = [];

    //*******************
    //	Relevant socket listeners
    //*******************
    /* Active ads */
    serverApi.registerListener(serverApi.serverEvent_ActiveAdsDataResponse, function (data) {
        this.activeAds = data.activeAds;
        console.log("Active ads amount : " + data.activeAds.length);
    }.bind(this));
    /* Active ads by station */
    serverApi.registerListener(serverApi.serverEvent_ActiveAdsByStationRes, function (data) {
        this.activeAds = data.activeAds;
        console.log("Active ads amount : " + data.activeAds.length);
    }.bind(this));
    /* All ads */
    serverApi.registerListener(serverApi.serverEvent_AllAdsDataResponse, function (data) {
        this.allAds = data.allAds;
        this.num = data.allAds.length;
    }.bind(this));

    /* All ads */
    serverApi.registerListener(serverApi.serverEvent_AddCreatedEvent, function (data) {
        console.log("Got created ad event");
        refreshAllAds();
    });
    /* All ads */
    serverApi.registerListener(serverApi.serverEvent_AddUpdatedEvent, function (data) {
        console.log("Got updated ad event");
        refreshAllAds();
    });
    /* All ads */
    serverApi.registerListener(serverApi.serverEvent_AddDeletedEvent, function (data) {
        console.log("Got deleted ad event");
        refreshAllAds();
    });

    serverApi.registerListener(serverApi.serverEvent_AllDisplaysResponse, function (data) {
        this.allStations = data;
    }.bind(this));

    function refreshActive(){
        serverApi.emit_GetActiveAdsData();
    }
    function refreshActiveByStation(stationId){
        serverApi.emit_GetActiveAdsByStation(stationId);
    }
    function refreshFullAds(){
        serverApi.emit_GetAllAdsData();
    }

    function refreshAllAds(){
        refreshActive();
        refreshFullAds();
    }

    function getAdById(id){
        var ad = undefined;

        var index;
        for (index = 0; index < this.allAds.length; ++index) {
            if(this.allAds[index]._id === id){
                return this.allAds[index];
            }
        }
        return ad;
    }

    this.getAdById = getAdById;
    this.refreshActive = refreshActive;
    this.refreshActiveByStation = refreshActiveByStation;
});