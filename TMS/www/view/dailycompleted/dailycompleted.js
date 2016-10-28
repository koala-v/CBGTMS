'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform', 'ionicDatePicker', 'SqlService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform, ionicDatePicker, SqlService) {
        var dataResults = new Array();
        $scope.DailyCompleted = {
            tobk1s: []
        };
        $scope.Search = {
            CompletedDate: moment(new Date()).format('YYYYMMDD'),
        };

        var getobjTobk1 = function (objTobk1, i) {
            var jobs = {
                key: objTobk1.Key,
                DCFlagWithPcsUom: objTobk1.DCFlag + ' ' + objTobk1.PcsUom,
                time: is.equal(objTobk1.AppHideScheduleTime, 'Y') ? checkDatetime(objTobk1.TimeFrom) : 'S/No: ' + (parseInt(i) + 1),
                PostalCode: objTobk1.PostalCode,
                customer: {
                    name: objTobk1.DeliveryToName,
                    address: objTobk1.DeliveryToAddress1 + objTobk1.DeliveryToAddress2 + objTobk1.DeliveryToAddress3 + objTobk1.DeliveryToAddress4
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
            var strSqlFilter = "UpdatedFlag != '' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
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

        $scope.WifiConfirm = function () {
            var strSqlFilter = "UpdatedFlag = 'N' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                dataResults = new Array();
                if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var objTobk1 = results.rows.item(i);
                        dataResults.push(objTobk1);
                        if (objTobk1.StatusCode === 'POD') {
                            var jsonData = {
                                'Base64': 'data:image/png;base64,' + objTobk1.TempBase64,
                                'FileName': 'signature.Png'
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
                    var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1/update');
                    ApiService.Post(objUri, jsonData, true).then(function success(result) {
                        // PopupService.Info(null, 'Cancel Success', '').then(function (res) {
                        //     $scope.returnList();
                        // });
                    });

                    var objTobk1 = {
                        UpdatedFlag: 'Y'
                    };
                    SqlService.Update('Tobk1', objTobk1, strSqlFilter).then(function (res) {});

                }
            });
        };
    }
]);
