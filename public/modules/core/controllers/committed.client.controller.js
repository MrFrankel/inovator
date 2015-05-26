'use strict';


angular.module('core').controller('CommittedController', ['$scope', '$location','Authentication', 'Articles',
	function($scope,$location, Authentication, Articles) {
        $scope.articles = Articles.query();
        $scope.authentication = Authentication;
        $scope.oneAtATime = false;

        $scope.isCommitted = function (article){
           return article.committed;
        };
        $scope.go = function ( path, articleId ) {
            $location.path( path + '/' + articleId );
        };
		// This provides Authentication context.

	}
]);