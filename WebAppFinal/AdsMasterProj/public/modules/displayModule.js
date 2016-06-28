var displayModule = angular.module('displayModule',['advertisementsModule']);

displayModule.controller('displayAdsCtrl',function($scope,$timeout,adsService){
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "This is an example",
        owner : "Ads With Us",
        texts : [ { text: 'try it yourself' } ],
        images : [{url: '/images/canvs1.jpg'}],
        moneyInvested : 200
    };

    $scope.displayedAd = {
        name : "",
        texts : [],
        images : []
    };

    function getAdToDisplay(){
        if (adsService.activeAds.length == 0){
            $scope.displayedAd = emptyAd;
            adsService.refreshActive();
        } else {
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }
            $scope.displayedAd = adsService.activeAds[curId];
            curId = (curId + 1) % adsService.activeAds.length;
        }
        timer = $timeout(getAdToDisplay , getDisplayedTimeByMoney($scope.displayedAd.moneyInvested));
    }

    function getDisplayedTimeByMoney(money){
        if (money <= 0) {
            return 1000;
        }
        return ((money / 100) * 1000);
    }

    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    adsService.refreshActive();

    // Initiates the display
    getAdToDisplay();

});

displayModule.controller('displayAdsByStationCtrl',function($scope,$timeout,$routeParams,adsService){
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "This is an example",
        owner : "The Ads Master",
        texts : [ { text: 'try it yourself' } ],
        images : [ { url: '/images/canvs1.jpg'} ],
        moneyInvested : 200
    };

    // The dsiplayed ad
    $scope.displayedAd = {
        name : '',
        texts : [],
        images : []
    };

    $scope.stations = adsService.allStations;
    $scope.stationId = $routeParams.stationId;
    if ($scope.stationId === '0') {
      $scope.selectedText = "Select station";
    } else{
        $scope.stations.forEach(function(station)
        {
           if (station.id === $scope.stationId)
           {
               $scope.selectedText = station.name;
           }
        });
    }

    $scope.hideAdFunc = function() {
        adsService.activeAds = [];
    };

    function getAdToDisplay(){
        if (adsService.activeAds.length == 0){
            $scope.displayedAd = emptyAd;
            adsService.refreshActiveByStation($scope.stationId);
        } else {
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }
            $scope.displayedAd = adsService.activeAds[curId];
            curId = (curId + 1) % adsService.activeAds.length;
        }
        timer = $timeout(getAdToDisplay , getDisplayedTimeByMoney($scope.displayedAd.moneyInvested));
    }

    function getDisplayedTimeByMoney(money){
        if (money <= 0) {
            return 1000;
        }
        return ((money / 100) * 1000);
    }

    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    if ($scope.stationId != '0') {
        adsService.refreshActiveByStation($scope.stationId);
        // Initiates the display
        getAdToDisplay();
    }
});

