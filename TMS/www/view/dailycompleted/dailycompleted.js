'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform', '$cordovaNetwork','ionicDatePicker', 'SqlService','PopupService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform,$cordovaNetwork, ionicDatePicker, SqlService,PopupService) {
        var dataResults = new Array();
        $scope.DailyCompleted = {
            tobk1s: []
        };
        $scope.Search = {
            CompletedDate: moment(new Date()).format('YYYYMMDD'),
        };

        var getobjTobk1 = function (objTobk1) {
            var jobs = {
                key: objTobk1.Key,
                LineItemNo: objTobk1.LineItemNo,
                DCFlagWithPcsUom: objTobk1.DCFlag + ' ' + objTobk1.PcsUom,
                // time: checkDatetime(objTobk1.TimeFrom),
                time: is.not.equal(objTobk1.AppHideScheduleTime, 'Y') ? checkDatetime(objTobk1.TimeFrom) : 'S/No: ' + objTobk1.JobSeqNo,
                PostalCode: objTobk1.PostalCode,
                customer: {
                    name: objTobk1.FromLocationName,
                    address: objTobk1.FromLocationAddress1 + "  " + objTobk1.FromLocationAddress2 + "  " + objTobk1.FromLocationAddress3 + "  " + objTobk1.FromLocationAddress4 + "      " + objTobk1.ToLocationName + "  " + objTobk1.ToLocationAddress1 + "  " + objTobk1.ToLocationAddress2 + "  " + objTobk1.ToLocationAddress3 + "    " + objTobk1.ToLocationAddress4
                },
                status: {
                    inprocess: is.equal(objTobk1.StatusCode, 'POD') ? false : true,
                    success: is.equal(objTobk1.StatusCode, 'POD') ? true : false,
                    failed: is.equal(objTobk1.StatusCode, 'CANCEL') ? true : false,
                }
            };

            return jobs;
        };

        var ShowDailyCompleted = function () {

            var strSqlFilter = "UpdatedFlag != '' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'";
            // var strSqlFilter = "UpdatedFlag != '' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                $scope.DailyCompleted.tobk1s = new Array();
                if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var jobs = getobjTobk1(results.rows.item(i));
                        $scope.DailyCompleted.tobk1s.push(jobs);
                    }
                }
            });
        };

        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };

        $scope.OnDatePicker = function () {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    $scope.Search.CompletedDate = moment(new Date(val)).format('YYYYMMDD');
                    ShowDailyCompleted();
                },
                to: new Date(),
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        ShowDailyCompleted();
        $scope.returnList = function () {
            $state.go('index.login', {}, {
                reload: true
            });
        };
        $scope.WifiConfirm = function () {
          if (!ENV.fromWeb) {
              if ($cordovaNetwork.isOffline()) {
                  ENV.wifi = false;
              } else {
                  ENV.wifi = true;

              }
          }

          if (ENV.wifi === true) {
            var strSqlFilter = "UpdatedFlag = 'N' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
            // var strSqlFilter = " FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'";
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                dataResults = new Array();
                if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var objTobk1 = results.rows.item(i);
                        dataResults.push(objTobk1);
                        if (objTobk1.StatusCode === 'POD') {
                            var jsonData = {
                                'Base64': 'data:image/png;base64,' + objTobk1.TempBase64,
                                'FileName': objTobk1.Key + '_' + objTobk1.LineItemNo + '.Png'
                            };
                            if (objTobk1.TempBase64 !== null && is.not.equal(objTobk1.TempBase64, '') && is.not.undefined(objTobk1.TempBase64)) {
                                objUri = ApiService.Uri(true, '/api/tms/upload/img');
                                objUri.addSearch('Key', objTobk1.Key);
                                objUri.addSearch('TableName', objTobk1.TableName);
                                ApiService.Post(objUri, jsonData, true).then(function success(result) {});
                            }
                        }
                    }
                    var jsonData = {
                        "UpdateAllString": JSON.stringify(dataResults)
                    };
                    var objUri = ApiService.Uri(true, '/api/tms/tobk1/update');
                    ApiService.Post(objUri, jsonData, true).then(function success(result) {
                        var objTobk1 = {
                            UpdatedFlag: 'Y'
                        };
                        SqlService.Update('Tobk1', objTobk1, strSqlFilter).then(function (res) {});
                        PopupService.Info(null, 'UpdateConfirm Success', '').then(function (res) {
                          $scope.returnMain();
                        });
                    });
                }
            });
          }
            else{
              PopupService.Alert(null, 'Please Open WIFI').then(function (res) {
                    $scope.returnMain();
              });
            }
        };
    }
]);
