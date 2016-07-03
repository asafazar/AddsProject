var homeModule = angular.module('homeModule',['ngTable','uiGmapgoogle-maps','socketModule']);

homeModule.controller('itunesController',function ($scope,$filter,ngTableParams,serverApi){
    $scope.itunesItems = [];

    /* Handle itunes response */
    serverApi.registerListener(serverApi.serverEvent_ItunesResponse, function (data){
        $scope.itunesItems = data.items;
        $scope.tableParams.reload();
    })

    $scope.requestItunesData = function (searchTerm){
        serverApi.emit_GetItunesData(searchTerm);
    }

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 100,
        sorting: {
            name: 'asc'
        },
        filter: {
            name: ''
        }

    }, {
        total: $scope.itunesItems.length,
        getData: function($defer, params) {

            var orderedData = params.filter() ?
                $filter('filter')($scope.itunesItems, params.filter()) :
                $scope.itunesItems;

            orderedData = params.sorting() ?
                $filter('orderBy')(orderedData, params.orderBy()) :
                orderedData;

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        },
        filterDelay : 0
    });

    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_ItunesResponse);
    });
});

homeModule.controller('displaysMapCtrl',function ($scope, serverApi){
    $scope.map = {
        center:
        { latitude: 32.069894,
            longitude: 34.778652
        },
        zoom: 8,
        events: function (map, eventName, originalEventArgs) {
            var e = originalEventArgs[0];
            var lat = e.latLng.lat(),lon = e.latLng.lng();
            var marker = {
                id: Date.now(),
                coords: {
                    latitude: lat,
                    longitude: lon
                }
            };
            $scope.map.models.push(marker);
            console.log($scope.map.markers);
            $scope.$apply();
    }};

    $scope.map.models = [];

    /* Handle displays data response */
    serverApi.registerListener(serverApi.serverEvent_AllDisplaysResponse, function (data){
        convertDisplaysData(data);
    });

    /* Converts the displays data from the serve's format to the maps format */
    function convertDisplaysData(displays){
        var models = [];

        displays.map(function(item){

            var convertedItem = {
                id : item.id,
                longitude : Number(item.location.long),
                latitude  : Number(item.location.lat),
                options : {
                    title : item.name
                }
            };

            $scope.map.models.push(convertedItem);
        });
    }

    // Send a request for the displays data
    serverApi.emit_GetAllDisplays();

    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_AllDisplaysResponse);
    });
});

homeModule.controller('statsCtrl',function ($scope, $filter,ngTableParams, serverApi) {
    $scope.ownersData = [];
    $scope.budgetPieData = [];
    $scope.adsPieData = [];
    $scope.ownersColors = [];
        $scope.adsDataSet=[];
    $scope.budgetDataSet=[];
    $scope.colors = ["#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#900C3F","#581845"];

    serverApi.registerListener(serverApi.serverEvent_OwnersDataResponse, function (data) {
        $scope.ownersData = data;
        $scope.budgetPieData = [];
        $scope.adsPieData = [];
        $scope.budgetDataSet=[];
        $scope.ownersColors = [];
        $scope.adsDataSet=[];

        $scope.ownersData.forEach(function(owner){
            $scope.budgetPieData.push(
                {
                    value: owner.moneyInvested,
                    color : $scope.colors[$scope.budgetPieData.length % $scope.colors.length]
                });
            $scope.adsPieData.push(
                {
                    value: owner.count,
                    color : $scope.colors[$scope.adsPieData.length % $scope.colors.length]
                });
            $scope.ownersColors.push(
                {
                    name: owner.owner,
                    color: $scope.colors[$scope.ownersColors.length % $scope.colors.length]
                });
            $scope.adsDataSet.push(
                {
                    label: owner.owner,
                    count: owner.count
                });
            $scope.budgetDataSet.push(
                {
                    label: owner.owner,
                    count: owner.moneyInvested
                });
        });

        $scope.tableParams.reload();
    }.bind(this));

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
            name: 'asc'     // initial sorting
        },
        filter: {
            name: ''      // initial filter
        }

    }, {
        total: $scope.ownersData.length, // length of data
        getData: function($defer, params) {

            // Filter (Using anguar's default filter)
            var orderedData = $scope.ownersData;

            // Now , order filtered data
            orderedData = params.sorting() ?
                $filter('orderBy')(orderedData, params.orderBy()) :
                orderedData;

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        },
        filterDelay : 0
    });

    serverApi.emit_getOwnersData();
});