'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'ideas';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'multi-select',
        'timer'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';  /*
// Configuring the Articles module
angular.module('articles').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Inventions', 'articles', 'dropdown', '/articles(/create)?');
        Menus.addSubMenuItem('topbar', 'articles', 'New Invention', 'articles/create');
    }
]);*/'use strict';
// Setting up route
angular.module('articles').config([
  '$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider.state('listArticles', {
      url: '/articles',
      templateUrl: 'modules/articles/views/list-articles.client.view.html'
    }).state('createArticle', {
      url: '/articles/create',
      templateUrl: 'modules/articles/views/create-article.client.view.html'
    }).state('viewArticle', {
      url: '/articles/:articleId',
      templateUrl: 'modules/articles/views/view-article.client.view.html'
    }).state('editArticle', {
      url: '/articles/:articleId/edit',
      templateUrl: 'modules/articles/views/edit-article.client.view.html'
    });
  }
]);'use strict';
angular.module('articles').controller('ArticlesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Articles',
  '$http',
  'Users',
  function ($scope, $stateParams, $location, Authentication, Articles, $http, Users) {
    var units = [
        {
          name: 'second',
          limit: 60,
          in_seconds: 1
        },
        {
          name: 'minute',
          limit: 3600,
          in_seconds: 60
        },
        {
          name: 'hour',
          limit: 86400,
          in_seconds: 3600
        },
        {
          name: 'day',
          limit: 604800,
          in_seconds: 86400
        },
        {
          name: 'week',
          limit: 2629743,
          in_seconds: 604800
        },
        {
          name: 'month',
          limit: 31556926,
          in_seconds: 2629743
        },
        {
          name: 'year',
          limit: null,
          in_seconds: 31556926
        }
      ];
    $scope.authentication = Authentication;
    $scope.membersSelected = [];
    $scope.membersToShowSelected = [];
    var updateMembers = function () {
      $scope.article.members = [$scope.article.members.shift()];
      $scope.users.some(function (user) {
        return $scope.membersToShowSelected.forEach(function (selMember) {
          if (user._id === selMember._id) {
            $scope.article.members.push(user);
          }
        });
      });
    };
    $scope.create = function () {
      var article = new Articles({
          title: this.title,
          content: this.content,
          members: [$scope.authentication.user]
        });
      article.$save(function (response) {
        $location.path('articles/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      this.title = '';
      this.content = '';
    };
    $scope.remove = function (article) {
      if (article) {
        article.$remove();
        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('/list');
        });
      }
    };
    $scope.update = function () {
      updateMembers();
      var article = $scope.article;
      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.find = function () {
      $scope.articles = Articles.query();
      $scope.users = Users.query();
    };
    $scope.findOne = function () {
      Articles.get({ articleId: $stateParams.articleId }, function (article) {
        $scope.article = article;
        $scope.users = Users.query(function (data) {
          function amISelected(id) {
            return article.members.some(function (member) {
              if (member._id === id) {
                return true;
              }
            });
          }
          $scope.membersSelected.length = 0;
          data.forEach(function (user) {
            if (user._id === $scope.article.user._id) {
              return;
            }
            var listItem = {
                displayName: user.displayName,
                goodAt: user.goodAt,
                _id: user._id,
                selected: amISelected(user._id)
              };
            $scope.membersSelected.push(listItem);
          });
        });
      });
      function refresh() {
        angular.element(document.querySelector('.multiSelect button')).triggerHandler('click');
      }
      setTimeout(refresh, 200);
    };
    $scope.addComment = function (content) {
      var article = $scope.article;
      article.comments.push({
        author: $scope.authentication.user,
        date: new Date(),
        content: $scope.comment
      });
      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      $scope.comment = '';
    };
    $scope.timeAgo = function (time) {
      var diff = (new Date() - new Date(time)) / 1000;
      if (diff < 1)
        return '1 sec';
      var i = 0;
      var unit = units[i++];
      while (unit) {
        if (diff < unit.limit || !unit.limit) {
          diff = Math.floor(diff / unit.in_seconds);
          return diff + ' ' + unit.name + (diff > 1 ? 's' : '');
        }
        unit = units[i++];
      }
    };
    $scope.filterMeOut = function (user) {
      // Do some tests
      if (user._id === $scope.authentication.user._id) {
        return false;  // this will be listed in the results
      }
      return true;  // otherwise it won't be within the results
    };
    $scope.thisItemIsDisabled = function () {
      if ($scope.membersToShowSelected.length >= 4) {
        return false;
      }
      return true;
    };
  }
]);'use strict';
//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', [
  '$resource',
  function ($resource) {
    return $resource('articles/:articleId', { articleId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
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
]);'use strict';
angular.module('core').controller('CommittedController', [
  '$scope',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $location, Authentication, Articles) {
    $scope.articles = Articles.query();
    $scope.authentication = Authentication;
    $scope.oneAtATime = false;
    $scope.isCommitted = function (article) {
      return article.committed;
    };
    $scope.go = function (path, articleId) {
      $location.path(path + '/' + articleId);
    };  // This provides Authentication context.
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $location, Authentication, Articles) {
    $scope.authentication = Authentication;
    $scope.go = function (path) {
      $location.path(path);
    };
    var slides = $scope.slides = [];
    $scope.myInterval = 5000;
    Articles.query(function (data) {
      data.forEach(function (article) {
        var newWidth = 600 + slides.length;
        slides.push(article);
      });
    });
  }
]);'use strict';
angular.module('core').controller('ListController', [
  '$scope',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $location, Authentication, Articles) {
    $scope.articles = Articles.query();
    $scope.quotes = [
      {
        author: 'Mason Cooley',
        text: 'Art begins in imitation and ends in innovation'
      },
      {
        author: 'W. Edwards Deming',
        text: 'Innovation comes from the producer - not from the customer'
      },
      {
        author: 'Anna Eshoo',
        text: 'Innovation is the calling card of the future'
      },
      {
        author: 'John Emmerling',
        text: 'Innovation is creativity with a job to do'
      },
      {
        author: 'Albert Einstein',
        text: 'The true sign of intelligence is not knowledge but imagination'
      },
      {
        author: 'Albert Einstein',
        text: 'The hardest thing to understand in the world is the income tax'
      },
      {
        author: 'Albert Einstein',
        text: 'Two things are infinite: the universe and human stupidity, and Im not sure about the universe'
      },
      {
        author: 'Steve Jobs',
        text: 'I want to put a ding in the universe'
      },
      {
        author: 'Douglas Adams',
        text: 'Dont Panic!'
      }
    ];
    $scope.quote = $scope.quotes[Math.floor(Math.random() * $scope.quotes.length)];
    $scope.go = function (path, articleId) {
      $location.path(path + '/' + articleId);
    };
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    }).state('email', {
      url: '/email',
      templateUrl: 'modules/users/views/email.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/list');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/list');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('EmailController', [
  '$scope',
  '$window',
  '$http',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $window, $http, $location, Authentication, Articles) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if (!$scope.authentication.user) {
      $location.path('/signin');
    }
    $scope.email = function () {
      var artId = $location.search().article;
      angular.element(document.querySelector('body')).css('cursor', 'progress');
      $scope.article = Articles.get({ articleId: artId }, function () {
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
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, {
      update: { method: 'PUT' },
      getAll: { method: 'GET' }
    });
  }
]);