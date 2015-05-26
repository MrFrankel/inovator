'use strict';


angular.module('core').controller('ListController', ['$scope', '$location','Authentication', 'Articles',
	function($scope,$location, Authentication, Articles) {
        $scope.articles = Articles.query();
        $scope.quotes = [
            {
                author:'Mason Cooley',
                text:'Art begins in imitation and ends in innovation'
            },
            {
                author:'W. Edwards Deming',
                text:'Innovation comes from the producer - not from the customer'
            },
            {
                author:'Anna Eshoo',
                text:'Innovation is the calling card of the future'

            },
            {
                author:'John Emmerling',
                text:'Innovation is creativity with a job to do'

            },
            {
                author:'Albert Einstein',
                text:'The true sign of intelligence is not knowledge but imagination'

            },
            {
                author:'Albert Einstein',
                text:'The hardest thing to understand in the world is the income tax'

            },
            {
                author:'Albert Einstein',
                text:'Two things are infinite: the universe and human stupidity, and Im not sure about the universe'

            },
            {
                author:'Steve Jobs',
                text:'I want to put a ding in the universe'
            },
            {
                author:'Douglas Adams',
                text:'Dont Panic!'
            }
        ];


        $scope.quote = $scope.quotes[Math.floor(Math.random() *  $scope.quotes.length)];

        $scope.go = function ( path, articleId ) {
            $location.path( path + '/' + articleId );
        };
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);