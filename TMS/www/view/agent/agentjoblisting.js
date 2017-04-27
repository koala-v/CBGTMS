'use strict';
app.controller('agentCtrl', ['ENV', '$scope', '$state', '$ionicLoading', '$ionicPopup', '$ionicFilterBar', '$ionicActionSheet', '$cordovaNetwork', 'ApiService', '$ionicPlatform', '$cordovaSQLite', '$timeout', 'SqlService',
    function (ENV, $scope, $state, $ionicLoading, $ionicPopup, $ionicFilterBar, $ionicActionSheet, $cordovaNetwork, ApiService, $ionicPlatform, $cordovaSQLite, $timeout, SqlService) {
        var filterBarInstance = null;
        var dataResults = new Array();
        var hmTobk1 = new HashMap();
        var getObjTobk1 = function (objTobk1) {
            var jobs = {
                key: objTobk1.Key,
                LineItemNo: objTobk1.LineItemNo,
                DCFlagWithPcsUom: objTobk1.DCFlag + ' ' + objTobk1.PcsUom,
                // time: checkDatetime(objTobk1.TimeFrom),
                time: is.not.equal(objTobk1.AppHideScheduleTime, 'Y') ? checkDatetime(objTobk1.TimeFrom) : 'S/No: ' + objTobk1.JobSeqNo,
                timeFrom: moment(objTobk1.TimeFrom).format('YYYY-MM-DD').toString(),
                PostalCode: objTobk1.PostalCode,
                customer: {
                    name: objTobk1.FromLocationName,
                    address: objTobk1.FromLocationAddress1 + "  " + objTobk1.FromLocationAddress2 + "  " + objTobk1.FromLocationAddress3 + "  " + objTobk1.FromLocationAddress4,
                    toAddress: objTobk1.ToLocationName + "  " + objTobk1.ToLocationAddress1 + "  " + objTobk1.ToLocationAddress2 + "  " + objTobk1.ToLocationAddress3 + "    " + objTobk1.ToLocationAddress4,
                    statusAdress: getStatusAddress(objTobk1)
                },
                status: {
                    //  inprocess: is.equal(objTobk1.StatusCode, 'POD') ? false : true,
                    success: checkScheduleDate(objTobk1),
                    // failed: is.equal(objTobk1.StatusCode, 'CANCEL') ? true : false,
                }
            };
            return jobs;
        };
var checkScheduleDate=function(objTobk1){
  if (moment(objTobk1.TimeFrom).format('YYYYMMDD')<moment(new Date()).format('YYYYMMDD')){
    return true;
  }else{
    return false;
  }

};
        var getStatusAddress = function (objTobk1) {
            if ((objTobk1.FromLocationAddress1 + "  " + objTobk1.FromLocationAddress2 + "  " + objTobk1.FromLocationAddress3 + "  " + objTobk1.FromLocationAddress4).trim() === '' && (objTobk1.ToLocationName + "  " + objTobk1.ToLocationAddress1 + "  " + objTobk1.ToLocationAddress2 + "  " + objTobk1.ToLocationAddress3 + "    " + objTobk1.ToLocationAddress4).trim() === '') {
                return false;
            } else {
                return true;
            }

        };
        var getSignature = function (objAemp1Aido1) {
            var objUri = ApiService.Uri(true, '/api/tms/tobk1/attach');
            objUri.addSearch('Key', objAemp1Aido1.Key);
            objUri.addSearch('LineItemNo', objAemp1Aido1.LineItemNo);
            objUri.addSearch('TableName', objAemp1Aido1.TableName);
            ApiService.Get(objUri, true).then(function success(result) {
                if (is.not.undefined(result.data.results)) {
                    $scope.signature = result.data.results;
                    var Tobk1Filter = "Key='" + objAemp1Aido1.Key + "' and LineItemNo='" + objAemp1Aido1.LineItemNo + "' and TableName='" + objAemp1Aido1.TableName + "' "; // not record
                    var objTobk1 = {
                        TempBase64: $scope.signature
                    };
                    SqlService.Update('Tobk1Pending', objTobk1, Tobk1Filter).then(function (res) {});
                }
            });
        };

        var showTobk1 = function () {
            if (!ENV.fromWeb) {
                if ($cordovaNetwork.isOffline()) {
                    ENV.wifi = false;
                } else {
                    ENV.wifi = true;

                }
            }

            if (ENV.wifi === true) {

                var strSqlFilter = " DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Tobk1Pending', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var Tobk1 = results.rows.item(i);
                            hmTobk1.set(Tobk1.Key, Tobk1.Key);
                        }
                        var objUri = ApiService.Uri(true, '/api/tms/tobk1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                          objUri.addSearch('ScheduleDateFlag', 'N');
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objTobk1 = results[i];
                                    var jobs = getObjTobk1(objTobk1);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    if (!hmTobk1.has(objTobk1.Key)) {
                                        SqlService.Insert('Tobk1Pending', objTobk1).then(function (res) {});
                                        getSignature(objTobk1);
                                    } else {
                                        var objTobk1RmRemark = objTobk1;
                                        var Tobk1filter = " Key='" + objTobk1.Key + "' and LineItemNo='" + objTobk1.LineItemNo + "'";
                                        delete objTobk1RmRemark.Remark;
                                        delete objTobk1RmRemark.Key;
                                        delete objTobk1.__type;
                                        SqlService.Update('Tobk1Pending', objTobk1RmRemark, Tobk1filter).then(function (res) {});

                                    }
                                }
                            }
                        });
                    } else {
                        var objUri = ApiService.Uri(true, '/api/tms/tobk1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                        objUri.addSearch('ScheduleDateFlag', 'N');
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objTobk1 = results[i];
                                    var jobs = getObjTobk1(results[i]);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    SqlService.Insert('Tobk1Pending', objTobk1).then(function (res) {});
                                    getSignature(objTobk1);

                                }
                            }
                        });
                    }

                });
            } else {

                var strSqlFilter = "  DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Tobk1Pending', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var objTobk1 = getObjTobk1(results.rows.item(i));
                            dataResults = dataResults.concat(objTobk1);
                        }
                        $scope.jobs = dataResults;
                    }
                });
            }
        };

        showTobk1();

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
                    return value.key.indexOf(filterText) > -1;
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
                //  showTobk1();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.gotoDetail = function (job) {
            $state.go('jobListingDetail', {
                'key': job.key,
                'LineItemNo': job.LineItemNo
            }, {
                reload: true
            });
        };
    }
]);
