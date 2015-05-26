'use strict';


angular.module('core').controller('HomeController', ['$scope', '$location','Authentication', 'Articles',
	function($scope,$location, Authentication, Articles) {


		$scope.authentication = Authentication;
        $scope.go = function ( path ) {
            $location.path( path  );
        };
        var slides = $scope.slides = [];
        $scope.myInterval = 5000;
        Articles.query(function (data){
            data.forEach(function (article){
                var newWidth = 600 + slides.length;
                slides.push(article);
            });

        });



	}
]);