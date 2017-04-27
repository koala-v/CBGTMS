'use strict';
var app = angular.module('TMS', [
    'ionic',
    'ionicLazyLoad',
    'ionic-datepicker',
    'ionic-timepicker',
    'angularFileUpload',
    'jett.ionic.filter.bar',
    'ionic.ion.headerShrink',
    'ionMdInput',
    'ngMessages',
    'ngCordova',
    'TMS.config',
    'TMS.directives',
    'TMS.services',
    'TMS.factories',
    'ui.select'

]);
app.run(['ENV', '$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicHistory', '$ionicLoading', '$cordovaToast', '$cordovaKeyboard', '$cordovaFile', '$cordovaSQLite', 'SqlService', 'TABLE_DB',
    function (ENV, $ionicPlatform, $rootScope, $state, $location, $timeout, $ionicHistory, $ionicLoading, $cordovaToast, $cordovaKeyboard, $cordovaFile, $cordovaSQLite, SqlService, TABLE_DB) {
        if (window.cordova) {
            ENV.fromWeb = false;
        } else {
            ENV.fromWeb = true;
        }
        $ionicPlatform.ready(function () {
            if (!ENV.fromWeb) {
                $cordovaKeyboard.hideAccessoryBar(true);
                $cordovaKeyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            SqlService.Init().then(function (res) {
                if (ENV.fromWeb) {
                    SqlService.Drop('Todr1_Rcbp1').then(function (res) {
                        SqlService.Create('Todr1_Rcbp1', TABLE_DB.Todr1_Rcbp1).then(function (res) {});
                    });
                    SqlService.Drop('Tobk1').then(function (res) {
                        SqlService.Create('Tobk1', TABLE_DB.Tobk1).then(function (res) {});
                    });
                    SqlService.Drop('Tobk1Pending').then(function (res) {
                        SqlService.Create('Tobk1Pending', TABLE_DB.Tobk1Pending).then(function (res) {});
                    });
                    SqlService.Drop('Jmjm1').then(function (res) {
                        SqlService.Create('Jmjm1', TABLE_DB.Jmjm1).then(function (res) {});
                    });
                } else {
                    SqlService.Create('Todr1_Rcbp1', TABLE_DB.Todr1_Rcbp1).then(function (res) {});
                    SqlService.Create('Tobk1', TABLE_DB.Tobk1).then(function (res) {});
                    SqlService.Create('Jmjm1', TABLE_DB.Jmjm1).then(function (res) {});
                    SqlService.Create('Tobk1Pending', TABLE_DB.Tobk1Pending).then(function (res) {});
                }
            });
        });
        $ionicPlatform.registerBackButtonAction(function (e) {
            e.preventDefault();
            // Is there a page to go back to?  $state.include ??
            if ($state.includes('index.main') || $state.includes('index.login') || $state.includes('splash')) {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom('Press again to exit.');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            } else if ($state.includes('acceptJob') || $state.includes('jobListingList') || $state.includes('agentjobListing')) {
                $state.go('index.main', {}, {
                    reload: true
                });
            } else if ($state.includes('jobListingDetail')) {
                $state.go('jobListingList', {}, {});
            } else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                // This is the last page: Show confirmation popup
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('Press again to exit.');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
            return false;
        }, 101);
    }
]);
app.config(['ENV', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$ionicFilterBarConfigProvider', '$httpProvider',
    function (ENV, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider, $httpProvider) {
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('top');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('top')
            /*
            $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
            $ionicConfigProvider.platform.android.navBar.alignTitle('center');
            $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
            $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
            $ionicConfigProvider.platform.ios.views.transition('ios');
            $ionicConfigProvider.platform.android.views.transition('android');
            */
            //$ionicConfigProvider.views.forwardCache(true);//开启全局缓存
        $ionicConfigProvider.views.maxCache(3); //关闭缓存
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function (data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function (obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' +
                            encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]' ?
                param(data) :
                data;
        }];
        $ionicConfigProvider.backButton.previousTitleText(false);
        //
        $stateProvider
            .state('index', {
                url: '',
                abstract: true,
                templateUrl: 'view//menu/menu.html',
                controller: 'IndexCtrl'
            })
            .state('splash', {
                url: '/splash',
                cache: 'false',
                templateUrl: 'view/splash/splash.html',
                controller: 'SplashCtrl'
            })
            .state('index.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'view/login/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('index.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: "view/main/main.html",
                        controller: 'MainCtrl'
                    }
                }
            })
            .state('googleMaps', {
                url: '/googleMaps/googleMaps',
                cache: 'false',
                templateUrl: 'view/googleMaps/googleMaps.html',
                controller: 'GoogleMapCtrl'
            })
            .state('index.setting', {
                url: '/setting/setting',
                views: {
                    'menuContent': {
                        templateUrl: 'view/setting/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('agentjobListing', {
                url: '/agent/agentjoblisting',
                cache: 'false',
                templateUrl: 'view/agent/agentjoblisting.html',
                controller: 'agentCtrl'
            })
            .state('agentDetail', {
                url: '/agent/agentjobdetail/:JobNo',
                cache: 'false',
                templateUrl: 'view/agent/agentjobdetail.html',
                controller: 'agentDetailCtrl'
            })
            .state('index.update', {
                url: 'updateApp/update/:Version',
                views: {
                    'menuContent': {
                        templateUrl: 'view/updateApp/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            })
            .state('jobListingList', {
                url: '/joblisting/list',
                cache: 'false',
                templateUrl: 'view/joblisting/list.html',
                controller: 'JoblistingListCtrl'
            })
            .state('jobListingDetail', {
                url: '/joblisting/detail/:key/:LineItemNo',
                cache: 'false',
                templateUrl: 'view/joblisting/detail.html',
                controller: 'JoblistingDetailCtrl'
            })
            .state('upload', {
                url: '/Upload/:Key/:TableName',
                templateUrl: 'view/joblisting/Upload.html',
                controller: 'UploadCtrl'
            })
            .state('goDriverCodeCtrl', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'view/login/login.html',
                        controller: 'goDriverCodeCtrl'
                    }
                }
            })
            .state('dailycompleted', {
                url: '/dailycompleted/dailylist',
                cache: 'false',
                templateUrl: 'view/dailycompleted/dailylist.html',
                controller: 'dailycompletedCtrl'
            })
            .state('jobListingConfirm', {
                url: '/joblisting/confirm/:key/:LineItemNo',
                cache: 'false',
                templateUrl: 'view/joblisting/confirm.html',
                controller: 'JoblistingConfirmCtrl'
            })
            .state('reports', {
                url: '/reports',
                cache: 'false',
                templateUrl: 'view/reports/list.html',
                controller: 'reportsListCtrl'
            });
        $urlRouterProvider.otherwise('/splash');
        /*
        $ionicFilterBarConfigProvider.theme('calm');
        $ionicFilterBarConfigProvider.clear('ion-close');
        $ionicFilterBarConfigProvider.search('ion-search');
        $ionicFilterBarConfigProvider.backdrop(false);
        $ionicFilterBarConfigProvider.transition('vertical');
        $ionicFilterBarConfigProvider.placeholder('Filter');
        */
    }
]);
app.constant('$ionicLoadingConfig', {
    template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
});
