var mainApp = angular.module('mainApp',['ngRoute','ngResource','socketModule','homeModule','displayModule','manageModule']);

//**************
//	Routes
//*************
mainApp.config(function($routeProvider){
    $routeProvider
        .when('/',
            {
                templateUrl: 'views/home/HomeIndex.html'
            })
        .when('/itunes',
            {
                controller: 'itunesController',
                templateUrl: 'views/home/Itunes.html'
            })
        .when('/locations',
            {
                controller: 'displaysMapCtrl',
                templateUrl: 'views/home/Stations.html'
            })
        .when('/tips',
            {
                templateUrl: 'views/home/Tips.html'
            })
        .when('/stats',
            {
                controller : 'statsCtrl',
                templateUrl: 'views/home/stats.html'
            })
        .when('/contact',
            {
                templateUrl: 'views/home/ContactUs.html'
            })
        .when('/about',
            {
                templateUrl: 'views/home/AboutUs.html'
            })
        .when('/displayAds',
            {
                controller : 'displayAdsCtrl',
                templateUrl: 'views/display/DisplayAds.html'
            })
        .when('/displayAds/:stationId',
            {
                controller : 'displayAdsByStationCtrl',
                templateUrl: 'views/display/DispAdsByStation.html'
            })
        .when('/manage',
            {
                controller : 'manageIndexCtrl',
                templateUrl: 'views/manage/ManageIndex.html'
            })
        .when('/manage/createAd',
            {
                controller : 'createAd',
                templateUrl: 'views/manage/CreateAd.html'
            })
        .when('/manage/editAd/:adId',
            {
                controller : 'EditAd',
                templateUrl: 'views/manage/EditAd.html'
            })
        .otherwise({ redirectTo: '/'});
});

mainApp.controller('navbarController',function ($scope, adsService, serverApi){
    serverApi.emit_GetAllDisplays();
    $scope.stations = adsService.allStations;

    function stationsLoaded() {
        var val = $scope.stations != '';
        return val;
    };

    $scope.stationsLoaded = stationsLoaded;
});