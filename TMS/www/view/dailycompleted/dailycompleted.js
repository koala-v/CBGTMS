'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform', 'ionicDatePicker', 'SqlService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform, ionicDatePicker, SqlService) {
        var dataResults = new Array();
        $scope.DailyCompleted={
          aemp1WithAido1s:[]
        };
        $scope.Search = {
            CompletedDate: moment(new Date()).format('YYYYMMDD'),
        };

        var getObjAemp1WithAido1 = function (objAemp1WithAido1) {
            var jobs = {
                key: objAemp1WithAido1.Key,
                DCFlagWithPcsUom: objAemp1WithAido1.DCFlag + ' ' + objAemp1WithAido1.PcsUom,
                time: checkDatetime(objAemp1WithAido1.TimeFrom),
                customer: {
                    name: objAemp1WithAido1.DeliveryToName,
                    address: objAemp1WithAido1.DeliveryToAddress1 + objAemp1WithAido1.DeliveryToAddress2 + objAemp1WithAido1.DeliveryToAddress3 + objAemp1WithAido1.DeliveryToAddress4
                },
                status: {
                    inprocess: is.equal(objAemp1WithAido1.StatusCode, 'POD') ? false : true,
                    success: is.equal(objAemp1WithAido1.StatusCode, 'POD') ? true : false,
                    failed: is.equal(objAemp1WithAido1.StatusCode, 'CANCEL') ? true : false,
                }
            };
            return jobs;
        };

        var ShowDailyCompleted = function () {
            var strSqlFilter = "UpdatedFlag != '' And FilterTime='" + $scope.Search.CompletedDate + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
              $scope.DailyCompleted.aemp1WithAido1s=new Array();
                if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var jobs = getObjAemp1WithAido1(results.rows.item(i));
                        $scope.DailyCompleted.aemp1WithAido1s.push(jobs);
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
                        var objAemp1WithAido1 = results.rows.item(i);
                        dataResults.push(objAemp1WithAido1);
                        if (objAemp1WithAido1.StatusCode === 'POD') {
                            var jsonData = {
                                'Base64': 'data:image/png;base64,' + objAemp1WithAido1.TempBase64,
                                'FileName': 'signature.Png'
                            };

                            if (objAemp1WithAido1.TempBase64 !== null && is.not.equal(objAemp1WithAido1.TempBase64, '') && is.not.undefined(objAemp1WithAido1.TempBase64)) {
                                objUri = ApiService.Uri(true, '/api/tms/upload/img');
                                objUri.addSearch('Key', objAemp1WithAido1.Key);
                                objUri.addSearch('TableName', objAemp1WithAido1.TableName);
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

                    var objAemp1WithAido1 = {
                        UpdatedFlag: 'Y'
                    };
                    SqlService.Update('Tobk1', objAemp1WithAido1, strSqlFilter).then(function (res) {});

                }
            });
        };
    }
]);
