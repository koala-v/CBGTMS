'use strict';
app.controller('LoginCtrl', ['ENV', '$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$cordovaToast', '$cordovaFile', '$cordovaAppVersion', 'ApiService', 'SqlService', '$ionicPlatform', '$cordovaSQLite', '$rootScope', 'PopupService',
    function (ENV, $scope, $http, $state, $stateParams, $ionicPopup, $timeout, $cordovaToast, $cordovaFile, $cordovaAppVersion, ApiService, SqlService, $ionicPlatform, $cordovaSQLite, $rootScope, PopupService) {

        $scope.logininfo = {
            strdriverID: '',
            strAgentID: '',
            strPassWord: '',
            strRole: '',
            CurRole: '1',
            NewRole: '1'
        };

        $scope.roles = [{
            text: 'Driver',
            value: '1'
        }, {
            text: 'Agent',
            value: '2'
        }];

        $scope.funcChangeRole = function () {
            var myPopup = $ionicPopup.show({
                template: '<ion-radio ng-repeat="role in roles" ng-value="role.value" ng-model="logininfo.NewRole">{{ role.text }}</ion-radio>',

                title: 'Select Login Role',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    onTap: function (e) {
                        $scope.logininfo.NewRole = $scope.logininfo.CurRole;
                    }
                }, {
                    text: 'Save',
                    type: 'button-positive',
                    onTap: function (e) {
                        for (var r in $scope.roles) {
                            if ($scope.logininfo.NewRole === $scope.roles[r].value) {
                                $scope.logininfo.CurRole = $scope.logininfo.NewRole;
                                $scope.logininfo.strRole = $scope.roles[r].text;
                            }
                        }
                    }
                }]
            });
        };

        $scope.funcRoleJuage = function (roleType) {
            if (roleType === 1) {
                if ($scope.logininfo.strRole === 'Driver') {
                    return true;
                } else {
                    return false;
                }
            } else if (roleType === 2) {
                if ($scope.logininfo.strRole === 'Agent') {
                    return true;
                } else {
                    return false;
                }
            }
        };

        $scope.funcLogin = function (blnDemo) {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
            if (is.equal($scope.logininfo.CurRole, '1')) {
                if (is.empty($scope.logininfo.strdriverID)) {
                    PopupService.Alert(null, 'Please Enter Driver ID.');
                } else {
                    var objUri = ApiService.Uri(true, '/api/tms/login/check').addSearch('DriverCode', $scope.logininfo.strdriverID);
                    ApiService.Get(objUri, true).then(function success(result) {
                        var results = result.data.results;
                        if (is.not.empty(results)) {
                            sessionStorage.clear();
                            sessionStorage.setItem('sessionDriverCode', $scope.logininfo.strdriverID);
                            var objTodr1_Rcbp1 = {
                                DriverCode: $scope.logininfo.strdriverID,
                            };
                            SqlService.Insert('Todr1_Rcbp1', objTodr1_Rcbp1).then(function (res) {});
                            $state.go('index.main', {}, {
                                reload: true
                            });
                            $rootScope.$broadcast('login');
                        } else {
                            PopupService.Alert(null, 'Invalid Driver ID.', '');
                        }
                    });
                }
            } else {
                if (is.empty($scope.logininfo.strAgentID)) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter Agent ID.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;
                }

                if (is.empty($scope.logininfo.strPassWord)) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter PassWord.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;

                }
                if (is.equal($scope.logininfo.CurRole, '2')) {
                    var objUri = ApiService.Uri(true, '/api/tms/login/check');
                    objUri.addSearch('BusinessPartyCode', $scope.logininfo.strAgentID);
                    objUri.addSearch('PassWord', $scope.logininfo.strPassWord);
                    ApiService.Get(objUri, true).then(function success(result) {
                        var results = result.data.results;
                        if (is.not.empty(results)) {
                            sessionStorage.clear();
                            sessionStorage.setItem('sessionAgentID', $scope.logininfo.strAgentID);
                            sessionStorage.setItem('sessionPassWord', $scope.logininfo.strPassWord);
                            var objTodr1_Rcbp1 = {
                                DriverCode: '',
                                BusinessPartyCode: $scope.logininfo.strAgentID,
                                PassWord: $scope.logininfo.strPassWord
                            };
                            SqlService.Insert('Todr1_Rcbp1', objTodr1_Rcbp1).then(function (res) {});
                            $state.go('index.main', {}, {
                                reload: true
                            });
                            $rootScope.$broadcast('login');
                        } else {
                            PopupService.Alert(null, 'Invalid Agent.');
                        }
                    });
                }
            }
        };

        if (window.cordova) {
            $scope.logininfo.strRole = 'Driver';
        } else {
            $scope.logininfo.strRole = 'Driver';
        }

        $('#iDriverID').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $scope.funcLogin();
            }
        });

        $ionicPlatform.ready(function () {
            SqlService.Select('Todr1_Rcbp1', '*').then(function (res) {
                    if (res.rows.length > 0) {
                        var objTodr1_Rcbp1 = res.rows.item(0);
                        if (is.not.empty(objTodr1_Rcbp1.DriverCode)) {
                            $rootScope.$broadcast('login');
                            sessionStorage.clear();
                            sessionStorage.setItem('sessionDriverCode', objTodr1_Rcbp1.DriverCode);
                            $state.go('index.main', {}, {
                                reload: true
                            });
                        } else {
                            $rootScope.$broadcast('login');
                            $scope.logininfo.strRole = 'Agent';
                            sessionStorage.clear();
                            sessionStorage.setItem('sessionAgentID', objTodr1_Rcbp1.BusinessPartyCode);
                            sessionStorage.setItem('sessionPassWord', objTodr1_Rcbp1.PassWord);
                            $state.go('index.main', {}, {
                                reload: true
                            });
                        }

                    }
                },
                function (error) {}
            );
        });
    }
]);
