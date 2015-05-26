'use strict';

angular.module('users').controller('EmailController', ['$scope','$window', '$http', '$location', 'Authentication','Articles',
	function($scope, $window,  $http, $location, Authentication, Articles) {
		$scope.authentication = Authentication;
		//If user is signed in then redirect back home
		if (!$scope.authentication.user){
            $location.path('/signin');
        }

        $scope.email = function() {
            var artId = ($location.search()).article;
            angular.element(document.querySelector('body')).css('cursor', 'progress');
            $scope.article = Articles.get({
                articleId: artId
            }, function(){
                $http.post('/email', {
                    'user': $scope.authentication.user,
                    'article': $scope.article,
                    'subject': $scope.subject,
                    'content': $scope.content

                }).success(function (data, status, headers, config) {
                    angular.element(document.querySelector('body')).css('cursor', 'default');
                    if (data.success) {
                        $window.history.back();
                        console.log(data);
                    } else {
                        $window.history.back();
                        console.log(data);
                    }
                });
            });


        };
	}
]);