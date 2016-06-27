var manageModule = angular.module('manageModule',['ngRoute','ngTable','ui.bootstrap','socketModule','advertisementsModule']);

manageModule.controller('manageIndexCtrl',function ($scope,$filter,ngTableParams, serverApi, adsService){
    $scope.tempa = adsService;
    $scope.ads = $scope.tempa.allAds;
    $scope.getStationNameById = function(stationId)
    {
        var stationName = '';
        $scope.tempa.allStations.forEach(function(station)
        {
          if (station.id === stationId)
          {
              stationName = station.name;
          }
        });

        return stationName;
    };

    $scope.$watchCollection('tempa.allAds',function(newValue , oldValue){
        $scope.ads = newValue;
        $scope.tableParams.reload();
    });

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            name: 'asc'
        },
        filter: {
            name: ''
        }

    }, {
        total: $scope.ads.length,
        getData: function($defer, params) {

            var orderedData = params.filter() ?
                $filter('filter')($scope.ads, params.filter()) :
                $scope.ads;

            orderedData = params.sorting() ?
                $filter('orderBy')(orderedData, params.orderBy()) :
                orderedData;

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        },
        filterDelay : 0
    });

    serverApi.emit_GetAllAdsData();

    $scope.callDelete = function(id){
        serverApi.emit_AdDelete(id);
    }
});

manageModule.controller('EditAd',function($scope,$routeParams,$location,serverApi,adsService){
    $scope.optionalStations = adsService.allStations;
    $scope.oneAtATime = true;
    $scope.dateFormat = 'dd-MMMM-yyyy';
    $scope.adId = $routeParams.adId;
    $scope.ad = adsService.getAdById($scope.adId);
    $scope.alerts = [];

    serverApi.registerListener(serverApi.serverEvent_AdValidation, function (data){
        console.log("Caugth event");
        if (data.valid){
            serverApi.emit_AdUpdate($scope.ad._id,getCleanAd($scope.ad));
            $location.path('/manage');
        }
        else{
            createWarningMessage(data.alerts[0]);
        }
    });

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    function doEdit(){
        // first , validate here
        if (validateAd($scope)){
            serverApi.emit_validateAd($scope.ad);
        }
    }

    $scope.doEdit = doEdit;

    //************
    //  Creation methods
    //************
    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_AdValidation);
    });
});

manageModule.controller('createAd',function($scope,$location,serverApi, adsService){
    $scope.optionalStations = adsService.allStations;
    $scope.ad = new emptyAd();
    $scope.oneAtATime = true;
    $scope.dateFormat = 'dd-MMMM-yyyy';
    $scope.alerts = [];

    serverApi.registerListener(serverApi.serverEvent_AdValidation, function (data){
        console.log("Caugth event");
        if (data.valid){
            serverApi.emit_AdCreate(getCleanAd($scope.ad));
            $location.path('/manage');
        }
        else{
            createWarningMessage(data.alerts[0], $scope);
        }
    });

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    //************
    //  Creation methods
    //************
    function doCreate(){
        // first , validate here
        if(validateAd($scope)){
            serverApi.emit_validateAd($scope.ad);
        }
    }

    $scope.doCreate = doCreate;

    //************
    //  Creation methods
    //************
    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_AdValidation);
    });
});

//************
//  Create alerts
//************
function createWarningMessage(mes, $scope){
    var newAlert = {
        type:'danger',
        msg : mes
    }

    $scope.alerts.push(newAlert);
}

//************
//  Validate Ad
//************
function validateAd($scope){
    // clear the alerts
    $scope.alerts = [];
    var valid = true;

    // Ensure basic data is not empty
    if ($scope.ad.name == ""){
        valid = false;
        createWarningMessage("Ad name cannot be empty", $scope);
    }
    if ($scope.ad.stationId == ""){
        valid = false;
        createWarningMessage("Ad must be linked to station", $scope);
    }
    if ($scope.ad.owner ==""){
        valid = false;
        createWarningMessage("Owner name cannot be empty", $scope);
    }
    if ($scope.ad.fields ==""){
        valid = false;
        createWarningMessage("Ad field cannot be empty", $scope);
    }
    if ($scope.ad.moneyInvested ==""){
        valid = false;
        createWarningMessage("Invested money cannot be empty", $scope);
    }
    if (($scope.ad.moneyInvested < 100) || ($scope.ad.moneyInvested > 5000)){
        valid = false;
        createWarningMessage("Invested money needs to be between 100 and 5000", $scope);
    }

    // Check dates
    if ($scope.ad.timeFrame.startDate ==""){
        valid = false;
        createWarningMessage("Start date cannot be empty", $scope);
    }
    if ($scope.ad.timeFrame.endDate ==""){
        valid = false;
        createWarningMessage("End date cannot be empty", $scope);
    }
    if (new Date($scope.ad.timeFrame.startDate) > new Date($scope.ad.timeFrame.endDate)){
        valid = false;
        createWarningMessage("End date cannot be after start date", $scope);
    }

    return valid;
}

// Creates an empty Ad;
function emptyAd() {
    return {
        stationId: '',
        name : '',
        owner : '',
        fields : '',
        moneyInvested : 100,
        texts : [{text: ''}, {text: ''},{text: ''},{text: ''},{text: ''}],
        images : [{url :''}, {url : ''}],
        timeFrame :{
            startDate:new Date(),
            endDate:new Date()
        }
    }
}
/*Get an ad object and returns a clean object - only the data that needs to be sent to the server*/
function getCleanAd(dirty){
    var ad = {};
    ad.name = dirty.name;
    ad.stationId = dirty.stationId;
    ad.owner = dirty.owner;
    ad.fields = dirty.fields;
    ad.moneyInvested = dirty.moneyInvested;
    ad.texts = dirty.texts;
    ad.images = dirty.images;
    ad.timeFrame = dirty.timeFrame;

    return ad;
}