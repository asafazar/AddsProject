var homeModule = angular.module('homeModule',['ngTable','uiGmapgoogle-maps','socketModule']);

homeModule.controller('songsController',function ($scope,$filter,ngTableParams,serverApi){
    // Declare the wanted track type.
    $scope.trackType = "track";
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
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
            name: 'asc'     // initial sorting
        },
        filter: {
            name: ''      // initial filter
        }

    }, {
        total: $scope.itunesItems.length, // length of data
        getData: function($defer, params) {

            // Filter (Using anguar's default filter)
            var orderedData = params.filter() ?
                $filter('filter')($scope.itunesItems, params.filter()) :
                $scope.itunesItems;

            // Now , order filtered data
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

homeModule.controller('displaysMapCntrl',function ($scope, serverApi){
    $scope.map = { center: { latitude: 32.069894, longitude: 34.778652 }, zoom: 8 };
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

homeModule.controller('statsCntrl',function ($scope, $filter,ngTableParams, serverApi) {
    $scope.ownersData = [];
    $scope.budgetPieData = [];
    $scope.adsPieData = [];
    $scope.ownersColors = [];
    $scope.colors = ["#1abc9c", "#00b0ff", "#27ae60", "#ff9e80", "#ce93d8", "#f48fb1", "#7e57c2", "#f0f4c3"];

    serverApi.registerListener(serverApi.serverEvent_OwnersDataResponse, function (data) {
        $scope.ownersData = data;
        $scope.budgetPieData = [];
        $scope.adsPieData = [];
        $scope.ownersColors = [];

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
                }
            );

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