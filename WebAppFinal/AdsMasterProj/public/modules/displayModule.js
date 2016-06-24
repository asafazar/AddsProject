var displayModule = angular.module('displayModule',['adsModule']);

displayModule.controller('displayAdsCntrl',function($scope,$timeout,adsService){
    // initialize
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "Here is an example",
        owner : "Ads Master",
        texts : [ { text: 'try it yourself' } ],
        images : [{url: '/images/canvs1.jpg'}],
        moneyInvested : 200
    };

    // The dsiplayed ad
    $scope.ad = {
        name : "",
        texts : [],
        images : []
    };

    function getAdToDisplay(){
        if (adsService.activeAds.length == 0){
            $scope.ad = emptyAd;
            // Request to refresh active ads
            adsService.refreshActive();
        } else {
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }
            $scope.ad = adsService.activeAds[curId];
            curId = (curId + 1) % adsService.activeAds.length;
        }
        timer = $timeout(getAdToDisplay , timeFromMoney($scope.ad.moneyInvested));
    }

    // Calculates how much time an ad will be displayed by the amount of invested money
    function timeFromMoney(money){
        if (money <= 0) {
            return 1000;
        }
        return ((money / 100) * 1000);
    }


    /* Ensure the timer will be removed */
    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    // Request to refresh active ads
    adsService.refreshActive();

    // Initiates the display
    getAdToDisplay();

});

displayModule.controller('displayAdsByStationCntrl',function($scope,$timeout,$routeParams,adsService){
    // initialize
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "Here is an example",
        owner : "Ads Master",
        texts : [ { text: 'try it yourself' } ],
        images : [ { url: '/images/canvs1.jpg'} ],
        moneyInvested : 200
    };

    // The dsiplayed ad
    $scope.ad = {
        name : '',
        texts : [],
        images : []
    };

    //$scope.showAd = false;
    $scope.stations = adsService.allStations;
    $scope.stationId = $routeParams.stationId;
    if ($scope.stationId === '0') {
      $scope.selectedText = "Select station";
    } else{
        $scope.selectedText = "Station " + $scope.stationId;
    }

    $scope.hideAdFunc = function() {
        adsService.activeAds = [];
    };

    function getAdToDisplay(){
        if (adsService.activeAds.length == 0){
            $scope.ad = emptyAd;
           // $scope.showAd = true;
            adsService.refreshActiveByStation($scope.stationId);
        } else {
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }
            $scope.ad = adsService.activeAds[curId];
            curId = (curId + 1) % adsService.activeAds.length;
        }
        timer = $timeout(getAdToDisplay , timeFromMoney($scope.ad.moneyInvested));
    }

    // Calculates how much time an ad will be displayed by the amount of invested money
    function timeFromMoney(money){
        if (money <= 0) {
            return 1000;
        }
        return ((money / 100) * 1000);
    }

    /* Ensure the timer will be removed */
    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    if ($scope.stationId != '0') {
        adsService.refreshActiveByStation($scope.stationId);
        // Initiates the display
        getAdToDisplay();
    }
});

