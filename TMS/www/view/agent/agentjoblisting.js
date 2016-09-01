'use strict';
app.controller('agentCtrl', ['$scope', '$state', 'ApiService', '$cordovaSms', '$cordovaToast', '$ionicFilterBar', '$cordovaNetwork', 'ENV', 'SqlService',
    function ($scope, $state, ApiService, $cordovaSms, $cordovaToast, $ionicFilterBar, $cordovaNetwork, ENV, SqlService) {
        var filterBarInstance = null;

        var dataResults = new Array();
        var hmjmjm1 = new HashMap();

        $scope.returnMain = function () {
            $state.go('index.login', {}, {
                reload: true
            });
        };

        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };

        $scope.showFilterBar = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.jobs,
                expression: function (filterText, value, index, array) {
                    return value.JobNo.indexOf(filterText) > -1;
                },
                //filterProperties: ['bookingno'],
                update: function (filteredItems, filterText) {
                    $scope.jobs = filteredItems;
                    if (filterText) {
                        console.log(filterText);
                    }
                }
            });
        };

        $scope.refreshItems = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.goAgentDetail = function (job) {
            $state.go('agentDetail', {
                JobNo: job.JobNo,
            }, {
                reload: true
            });
        };

        var getObjjmjm1 = function (Objjmjm1) {
            var jobs = {
                JobNo: Objjmjm1.JobNo,
                ETA: Objjmjm1.ETA,
                Pcs: Objjmjm1.Pcs,
                ConsigneeName: Objjmjm1.ConsigneeName,
                ActualArrivalDate: Objjmjm1.ActualArrivalDate,
                DeliveryDate: Objjmjm1.DeliveryDate,
            };
            return jobs;
        };

        var showjmjm1 = function () {
            if (!ENV.fromWeb) {
                if (is.not.equal($cordovaNetwork.getNetwork(), 'wifi')) {
                    ENV.wifi = false;
                } else {
                    ENV.wifi = true;
                }
            }
            if (ENV.wifi === true) {
                var strSqlFilter = "DeliveryAgentCode='" + sessionStorage.getItem("sessionAgentID") + "'"; // not record
                SqlService.Select('Jmjm1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var jmjm1 = results.rows.item(i);
                            hmjmjm1.set(jmjm1.JobNo, jmjm1.JobNo);

                        }
                        var objUri = ApiService.Uri(true, '/api/tms/jmjm1');
                        objUri.addSearch('DeliveryAgentCode', sessionStorage.getItem("sessionAgentID"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objjmjm1 = results[i];
                                    var jobs = getObjjmjm1(objjmjm1);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    if (!hmjmjm1.has(objjmjm1.JobNo)) {
                                        SqlService.Insert('jmjm1', objjmjm1).then(function (res) {});
                                    }
                                }
                            }
                        });
                    } else {
                        var objUri = ApiService.Uri(true, '/api/tms/jmjm1');
                        objUri.addSearch('DeliveryAgentCode', sessionStorage.getItem("sessionAgentID"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objjmjm1 = results[i];
                                    var jobs = getObjjmjm1(results[i]);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    SqlService.Insert('jmjm1', objjmjm1).then(function (res) {});
                                }
                            }
                        });
                    }

                });
            } else {
                var strSqlFilter = " DeliveryAgentCode='" + sessionStorage.getItem("sessionAgentID") + "'"; // not record
                SqlService.Select('jmjm1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var objjmjm1 = getObjjmjm1(results.rows.item(i));
                            dataResults = dataResults.concat(objjmjm1);
                        }
                        $scope.jobs = dataResults;
                    }
                });
            }
        };

        showjmjm1();

    }
]);
app.controller('agentDetailCtrl', ['$scope', '$state', 'ApiService', '$cordovaSms', '$cordovaToast', '$stateParams', '$ionicPlatform', 'SqlService', 'ionicDatePicker', 'ENV', '$cordovaNetwork', 'PopupService', 'ionicTimePicker',
    function ($scope, $state, ApiService, $cordovaSms, $cordovaToast, $stateParams, $ionicPlatform, SqlService, ionicDatePicker, ENV, $cordovaNetwork, PopupService, ionicTimePicker) {
        $scope.Detail = {
            Jmjm1: {
                JobNo: $stateParams.JobNo,
                showActualArrivalDate: '',
                showDeliveryDate: '',
                showActualArrivalTime: '',
                showDeliveryTime: ''
            },

        };

        var checkDateTime = function (obj, type) {
            if (obj === null) {
                return '';
            } else {
                if (type === '0') {
                    return obj.split(' ')[0];
                } else if (type === '1') {
                    if (obj.indexOf(' ') > 0) {
                        return obj.split(' ')[1];
                    } else {
                        return '';
                    }
                }
                return obj;
            }
        };
        $ionicPlatform.ready(function () {
            var strSqlFilter = "JobNo='" + $scope.Detail.Jmjm1.JobNo + "' ";
            SqlService.Select('Jmjm1', '*', strSqlFilter).then(function (results) {
                if (results.rows.length > 0) {
                    var Objjmjm1 = results.rows.item(0);
                    var Jmjm1 = {
                        JobNo: Objjmjm1.JobNo,
                        ETA: Objjmjm1.ETA,
                        Pcs: Objjmjm1.Pcs,
                        AwbBlNo: Objjmjm1.AwbBlNo,
                        Address: Objjmjm1.Address,
                        ConsigneeName: Objjmjm1.ConsigneeName,
                        ActualArrivalDate: Objjmjm1.ActualArrivalDate,
                        DeliveryDate: Objjmjm1.DeliveryDate,
                        showActualArrivalDate: checkDateTime(Objjmjm1.ActualArrivalDate, '0'),
                        showDeliveryDate: checkDateTime(Objjmjm1.DeliveryDate, '0'),
                        showActualArrivalTime: checkDateTime(Objjmjm1.ActualArrivalDate, '1'),
                        showDeliveryTime: checkDateTime(Objjmjm1.DeliveryDate, '1'),
                    };
                    $scope.Detail.Jmjm1 = Jmjm1;

                }
            });
        });

        $scope.OnTimePicker = function (Type) {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    if (typeof (val) === 'undefined') {
                        // console.log('Time not selected');
                    } else {
                        var selectedTime = new Date(val * 1000);
                        // console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                        var Time = '' + selectedTime.getUTCHours() + ':' + selectedTime.getUTCMinutes();
                        if (is.equal(Type, 1)) {
                            $scope.Detail.Jmjm1.showActualArrivalTime = Time;
                        } else {
                            $scope.Detail.Jmjm1.showDeliveryTime = Time;
                        }
                    }
                },
                inputTime: 50400, //Optional
                format: 12, //Optional
                step: 5, //Optional
                setLabel: 'Set' //Optional
            };

            ionicTimePicker.openTimePicker(ipObj1);
        };

        $scope.OnDatePicker = function (Type) {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    if (is.equal(Type, 1)) {
                        $scope.Detail.Jmjm1.showActualArrivalDate = moment(new Date(val)).format('YYYY-MM-DD');
                        $scope.Detail.Jmjm1.showActualArrivalTime = moment(new Date()).format('HH:mm');
                    } else {
                        $scope.Detail.Jmjm1.showDeliveryDate = moment(new Date(val)).format('YYYY-MM-DD');
                        $scope.Detail.Jmjm1.showDeliveryTime = moment(new Date()).format('HH:mm');
                    }
                },

            };
            ionicDatePicker.openDatePicker(ipObj1);
        };

        $scope.gotoConfirm = function () {
            var UpdatedValue = 'Y';
            if (!ENV.fromWeb) {
                if (is.not.equal($cordovaNetwork.getNetwork(), 'wifi')) {
                    ENV.wifi = false;
                    UpdatedValue = 'N';
                } else {
                    ENV.wifi = true;
                }
            }
            var jmjm1Filter = "JobNo='" + $scope.Detail.Jmjm1.JobNo + "'"; // not record
            $scope.Detail.Jmjm1.ActualArrivalDate = $scope.Detail.Jmjm1.showActualArrivalDate + ' ' + $scope.Detail.Jmjm1.showActualArrivalTime;
            if (is.empty($scope.Detail.Jmjm1.showActualArrivalDate)) {
                $scope.Detail.Jmjm1.ActualArrivalDate = null;
            }
            $scope.Detail.Jmjm1.DeliveryDate = $scope.Detail.Jmjm1.showDeliveryDate + ' ' + $scope.Detail.Jmjm1.showDeliveryTime;
            if (is.empty($scope.Detail.Jmjm1.showDeliveryDate)) {
                $scope.Detail.Jmjm1.DeliveryDate = null;
            }

            var objJmjm1 = {
                ActualArrivalDate: $scope.Detail.Jmjm1.ActualArrivalDate,
                DeliveryDate: $scope.Detail.Jmjm1.DeliveryDate,
                UpdatedFlag: UpdatedValue
            };
            SqlService.Update('Jmjm1', objJmjm1, jmjm1Filter).then(function (res) {
                if (UpdatedValue === 'Y' && is.not.undefined(res)) {
                    var arrJmjm1 = [];
                    arrJmjm1.push($scope.Detail.Jmjm1);
                    var jsonData = {
                        "confirmAllString": JSON.stringify(arrJmjm1)
                    };
                    var objUri = ApiService.Uri(true, '/api/tms/jmjm1/confirm');
                    ApiService.Post(objUri, jsonData, true).then(function success(result) {
                        PopupService.Info(null, 'Confirm Success', '').then(function (res) {
                            $scope.returnList();
                        });
                    });
                } else if (UpdatedValue === 'N') {
                    PopupService.Info(null, 'Confirm Success', '').then(function (res) {
                        $scope.returnList();
                    });
                }
            });

        };
        $scope.returnList = function () {
            $state.go('agentjobListing', {}, {
                reload: true
            });
        };
    }
]);
