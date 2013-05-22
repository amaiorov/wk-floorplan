'use strict';

/* App Module */

var wk_app = angular.module("wk", []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/admin', {templateUrl: 'partials/admin.html',   controller: SeatListCtrl}).
      when('/map', {templateUrl: 'partials/map.html', controller: SeatListCtrl}).
      when('/map/:floor', {templateUrl: 'partials/map.html', controller: SeatListCtrl}).
      otherwise({redirectTo: '/map'});
}]);