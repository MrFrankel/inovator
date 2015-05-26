'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).state('list', {
                url: '/list',
                templateUrl: 'modules/core/views/list.client.view.html'
        }).state('details', {
                url: '/details',
                templateUrl: 'modules/core/views/details.client.view.html'
        }).state('committed', {
                url: '/committed',
                templateUrl: 'modules/core/views/committed.client.view.html'
        }).state('prizes', {
                url: '/prizes',
                templateUrl: 'modules/core/views/prizes.client.view.html'
        });

    }
]);