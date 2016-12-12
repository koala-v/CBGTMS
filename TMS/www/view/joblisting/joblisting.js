'use strict';
app.controller('JoblistingListCtrl', ['ENV', '$scope', '$state', '$ionicLoading', '$ionicPopup', '$ionicFilterBar', '$ionicActionSheet', '$cordovaNetwork', 'ApiService', '$ionicPlatform', '$cordovaSQLite', '$timeout', 'SqlService',
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
                PostalCode: objTobk1.PostalCode,
                customer: {
                    name: objTobk1.FromLocationName,
                    address: objTobk1.FromLocationAddress1 + "  " + objTobk1.FromLocationAddress2 + "  " + objTobk1.FromLocationAddress3 + "  " + objTobk1.FromLocationAddress4+"      "+objTobk1.ToLocationName+ "  " + objTobk1.ToLocationAddress1 + "  " + objTobk1.ToLocationAddress2 + "  " + objTobk1.ToLocationAddress3+"    "+objTobk1.ToLocationAddress4
                },
                status: {
                    inprocess: is.equal(objTobk1.StatusCode, 'POD') ? false : true,
                    success: is.equal(objTobk1.StatusCode, 'POD') ? true : false,
                    failed: is.equal(objTobk1.StatusCode, 'CANCEL') ? true : false,
                }
            };
            return jobs;
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
                    SqlService.Update('Tobk1', objTobk1, Tobk1Filter).then(function (res) {});
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
                SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var Tobk1 = results.rows.item(i);
                            hmTobk1.set(Tobk1.Key, Tobk1.Key);
                        }
                        var objUri = ApiService.Uri(true, '/api/tms/tobk1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objTobk1 = results[i];
                                    var jobs = getObjTobk1(objTobk1);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    if (!hmTobk1.has(objTobk1.Key)) {
                                        SqlService.Insert('Tobk1', objTobk1).then(function (res) {});
                                        getSignature(objTobk1);
                                    } else {
                                        var objTobk1RmRemark = objTobk1;
                                        var Tobk1filter = " Key='" + objTobk1.Key + "' and LineItemNo='" + objTobk1.LineItemNo + "'";
                                        delete objTobk1RmRemark.Remark;
                                        delete objTobk1RmRemark.Key;
                                        delete objTobk1.__type;
                                        SqlService.Update('Tobk1', objTobk1RmRemark, Tobk1filter).then(function (res) {});

                                    }
                                }
                            }
                        });
                    } else {
                        var objUri = ApiService.Uri(true, '/api/tms/tobk1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objTobk1 = results[i];
                                    var jobs = getObjTobk1(results[i]);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;

                                    SqlService.Insert('Tobk1', objTobk1).then(function (res) {});
                                    getSignature(objTobk1);

                                }
                            }
                        });
                    }

                });
            } else {
                var strSqlFilter = "  DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
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

app.controller('JoblistingDetailCtrl', ['ENV', '$scope', '$state', '$ionicActionSheet', '$cordovaSms', '$stateParams', 'ApiService', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$cordovaBarcodeScanner', '$cordovaImagePicker', '$cordovaFile', '$cordovaFileTransfer', '$cordovaNetwork', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $ionicActionSheet, $cordovaSms, $stateParams, ApiService, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, $cordovaCamera, $cordovaBarcodeScanner, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, $cordovaNetwork, SqlService, PopupService) {
        var canvas = null,
            context = null;
        $scope.capture = null;
        $scope.modal_camera = null;
        $scope.Detail = {
            Tobk1: {
                Key: $stateParams.key,
                LineItemNo: $stateParams.LineItemNo
            },

        };

        $scope.cancelJmjm3s = [{
            text: 'Sender / Receiver Not In',
            value: 'SenderWithReceiver'
        }, {
            text: 'Address Not Correct',
            value: 'Address'
        }, {
            text: 'Goods Not Ready ',
            value: 'Goods'
        }, {
            text: 'Vehicle Breakdown',
            value: 'Vehicle'

        }, {
            text: ' Bad Weather',
            value: ' BadWeather'
        }, {
            text: 'Reassign Driver',
            value: 'ReassignDriver'
        }, {
            text: 'Remark',
            value: 'Remark'
        }];
        $scope.cancelJmjm3sItem = {
            NewItem: 'SenderWithReceiver',
            Remark: '',
        };

        $scope.refresh = function () {
            var objUri = ApiService.Uri(true, '/api/tms/tobk1');
            objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
            objUri.addSearch('BookingNo', $scope.Detail.Tobk1.Key);
            objUri.addSearch('LineItemNo', $scope.Detail.Tobk1.LineItemNo);
            ApiService.Get(objUri, true).then(function success(result) {
                var results = result.data.results;
                if (is.not.empty(results)) {
                    var objTobk1 = results[0];
                    var objTobk1RmRemark = objTobk1;
                    var Tobk1filter = " Key='" + objTobk1.Key + "' and LineItemNo='" + objTobk1.LineItemNo + "'";
                    // delete objTobk1RmRemark.Remark;
                    // delete objTobk1RmRemark.Key;
                    delete objTobk1.__type;
                    if ($scope.Detail.Tobk1.UpdateRemarkFlag === 'Y') {
                        objTobk1RmRemark.Remark = $scope.Detail.Tobk1.Remark;
                        objTobk1RmRemark.UpdateRemarkFlag = $scope.Detail.Tobk1.UpdateRemarkFlag;
                    }
                    $scope.Detail.Tobk1 = objTobk1RmRemark;
                    SqlService.Update('Tobk1', objTobk1RmRemark, Tobk1filter).then(function (res) {});

                }
            });
        };

        $ionicPlatform.ready(function () {
            var strSqlFilter = "key='" + $scope.Detail.Tobk1.Key + "'and LineItemNo='" + $scope.Detail.Tobk1.LineItemNo + "' ";
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                if (results.rows.length > 0) {
                    $scope.Detail.Tobk1 = results.rows.item(0);
                }
            });
        });

        var showCamera = function (type) {
            $ionicLoading.show();
            var sourceType = Camera.PictureSourceType.CAMERA;
            if (is.equal(type, 1)) {
                sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            }
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                //targetWidth: 768,
                //targetHeight: 1024,
                // mediaType: Camera.MediaType.PICTURE,
                cameraDirection: Camera.Direction.BACK,
                //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY),
                saveToPhotoAlbum: true
                    //correctOrientation:true
            };
            try {
                $cordovaCamera.getPicture(options).then(function (imageUri) {
                    var uri = '';
                    uri = ApiService.Uri(true, '/api/tms/upload/img');
                    uri.addSearch('Key', $scope.Detail.Tobk1.Key);
                    uri.addSearch('TableName', $scope.Detail.Tobk1.TableName);
                    var url = ApiService.Url(uri);
                    var filePath = imageUri,
                        trustHosts = true,
                        options = {
                            fileName: moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
                        };
                    $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                        .then(function (result) {
                            $ionicLoading.hide();
                            PopupService.Info(null, 'Upload Successfully');
                        }, function (err) {
                            $ionicLoading.hide();
                            console.error(err);
                            PopupService.Alert(null, err.message);
                        }, function (progress) {});
                }, function (err) {
                    $ionicLoading.hide();
                });
            } catch (e) {
                $ionicLoading.hide();
                console.error(e);
            }
        };
        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 480,
            videoWidth: 320,
            video: null // Will reference the video element on success
        };
        $ionicModal.fromTemplateUrl('camera.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_camera = modal;
        });
        $scope.$on('$destroy', function () {
            if (is.not.null($scope.modal_camera)) {
                $scope.modal_camera.remove();
            }
        });
        $scope.takePhoto = function () {
            var video = document.getElementById('videoS');
            context.drawImage(video, 0, 0, 320, 480);
            $scope.capture = canvas.toDataURL();
        };
        $scope.reCapture = function () {
            context.clearRect(0, 0, 320, 480);
            $scope.capture = null;
        };
        $scope.showGoogleMaps = function () {
            $state.go('googleMaps', {}, {});
        };
        $scope.uploadPhoto = function () {
            var jsonData = {
                'Base64': $scope.capture,
                'FileName': moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
            };
            var objUri = '';
            objUri = ApiService.Uri(true, '/api/tms/upload/img');
            objUri.addSearch('Key', $scope.Detail.Tobk1.Key);
            objUri.addSearch('TableName', $scope.Detail.Tobk1.TableName);
            ApiService.Post(objUri, jsonData, true).then(function success(result) {
                PopupService.Info(null, 'Upload Successfully', '').then(function () {
                    $scope.closeModal();
                });
            });
        };
        $scope.showActionSheet = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [{
                    text: 'Camera'
                }, {
                    text: 'From Gallery'
                }],
                //destructiveText: 'Delete',
                titleText: 'Select Picture',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        if (!ENV.fromWeb) {
                            showCamera(0);
                        } else {
                            $scope.modal_camera.show();
                            canvas = document.getElementById('canvas1');
                            context = canvas.getContext('2d');
                            $scope.reCapture();
                        }
                    } else if (index === 1) {
                        if (!ENV.fromWeb) {
                            showCamera(1);

                        } else {
                            $state.go('upload', {
                                'Key': $scope.Detail.Tobk1.Key,
                                'TableName': $scope.Detail.Tobk1.TableName
                            }, {});
                        }
                    }
                    return true;
                }
            });
        };
        $scope.closeModal = function () {
            $scope.modal_camera.hide();
        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {
                reload: true
            });
        };

        $scope.cancel = function () {
            if (is.not.equal($scope.Detail.Tobk1.StatusCode, 'POD')) {
                var myPopup = $ionicPopup.show({
                    templateUrl: 'popup-cancel.html',
                    title: 'Select  Item',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel',
                        onTap: function (e) {}
                    }, {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            for (var i in $scope.cancelJmjm3s) {
                                if ($scope.cancelJmjm3sItem.NewItem === $scope.cancelJmjm3s[i].value) {
                                    $scope.Detail.Tobk1.CancelDescription = $scope.cancelJmjm3s[i].text;
                                    if ($scope.cancelJmjm3sItem.NewItem === "Remark") {
                                        $scope.Detail.Tobk1.CancelDescription = $scope.cancelJmjm3sItem.Remark;
                                    }
                                }
                            }
                            var UpdatedValue = 'Y';
                            if (!ENV.fromWeb) {
                                if ($cordovaNetwork.isOffline()) {
                                    ENV.wifi = false;
                                    UpdatedValue = 'N';
                                } else {
                                    ENV.wifi = true;
                                }
                            }
                            var Tobk1Filter = "Key='" + $scope.Detail.Tobk1.Key + "' and LineItemNo='" + $scope.Detail.Tobk1.LineItemNo + "'and  TableName='" + $scope.Detail.Tobk1.TableName + "' "; // not record
                            var objTobk1 = {
                                Remark: $scope.Detail.Tobk1.Remark,
                                CancelDescription: $scope.Detail.Tobk1.CancelDescription,
                                StatusCode: 'CANCEL',
                                UpdatedFlag: UpdatedValue
                            };
                            SqlService.Update('Tobk1', objTobk1, Tobk1Filter).then(function (res) {
                                if (UpdatedValue === 'Y' && is.not.undefined(res)) {
                                    $scope.Detail.Tobk1.StatusCode = 'CANCEL';
                                    var arrAem1WithAido1 = [];
                                    arrAem1WithAido1.push($scope.Detail.Tobk1);
                                    var jsonData = {
                                        "UpdateAllString": JSON.stringify(arrAem1WithAido1)
                                    };
                                    var objUri = ApiService.Uri(true, '/api/tms/tobk1/update');
                                    ApiService.Post(objUri, jsonData, true).then(function success(result) {
                                        PopupService.Info(null, 'Cancel Success', '').then(function (res) {
                                            $scope.returnList();
                                        });
                                    });
                                } else if (UpdatedValue === 'N') {
                                    PopupService.Info(null, 'Cancel Success', '').then(function (res) {
                                        $scope.returnList();
                                    });
                                }
                            });

                        }
                    }]
                });
            } else {
                $scope.returnList();
            }
        };

        $scope.gotoConfirm = function () {
            var Tobk1Filter = "Key='" + $scope.Detail.Tobk1.Key + "'and LineItemNo='" + $scope.Detail.Tobk1.LineItemNo + "' and  TableName='" + $scope.Detail.Tobk1.TableName + "' "; // not record
            var objTobk1 = {
                Remark: $scope.Detail.Tobk1.Remark,
                UpdateRemarkFlag: 'Y'
            };
            SqlService.Update('Tobk1', objTobk1, Tobk1Filter).then(function (res) {});
            $state.go('jobListingConfirm', {
                'key': $scope.Detail.Tobk1.Key,
                'LineItemNo': $scope.Detail.Tobk1.LineItemNo
            }, {
                reload: true
            });
        };

    }
]);

app.controller('JoblistingConfirmCtrl', ['ENV', '$scope', '$state', '$stateParams', 'ApiService', '$ionicPopup', '$ionicPlatform', '$cordovaSQLite', '$cordovaNetwork', '$ionicLoading', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, ApiService, $ionicPopup, $ionicPlatform, $cordovaSQLite, $cordovaNetwork, $ionicLoading, SqlService, PopupService) {
        var canvas = document.getElementById('signatureCanvas'),
            signaturePad = new SignaturePad(canvas),
            strEemptyBase64 = '';
        $scope.signature = null;
        $scope.Confirm = {
            Tobk1: {
                Key: $stateParams.key,
                LineItemNo: $stateParams.LineItemNo,
            }
        };
        // var showRaido = function () {
        //
        //     $scope.OnBehalfOfs = [{
        //         text: $scope.Confirm.Tobk1.DeliveryToName,
        //         value: 'CustomerCode'
        //     }, {
        //         text: 'On Behalf Of ' + $scope.Confirm.Tobk1.DeliveryToName,
        //         value: 'OnBehalfOf'
        //     }, ];
        //     $scope.OnBehalfOfItem = {
        //         NewItem: 'CustomerCode',
        //         BehalfName: $scope.Confirm.Tobk1.OnBehalfName,
        //     };
        //
        // };
        // $scope.serverSideChange = function (item) {
        //     if ($scope.OnBehalfOfItem.NewItem === item.value) {
        //         $scope.Confirm.Tobk1.OnBehalfName = "";
        //         if ($scope.OnBehalfOfItem.NewItem === "OnBehalfOf") {
        //             $scope.Confirm.Tobk1.OnBehalfName = $scope.OnBehalfOfItem.BehalfName;
        //         }
        //     }
        //
        // };

        $ionicPlatform.ready(function () {
            var strSqlFilter = "key='" + $scope.Confirm.Tobk1.Key + "' and LineItemNo='" + $scope.Confirm.Tobk1.LineItemNo + "' ";
            SqlService.Select('Tobk1', '*', strSqlFilter).then(function (results) {
                if (results.rows.length > 0) {
                    $scope.Confirm.Tobk1 = results.rows.item(0);
                    // showRaido();
                    if ($scope.Confirm.Tobk1.TempBase64 !== null && is.not.empty($scope.Confirm.Tobk1.TempBase64)) {
                        if (is.not.equal(strEemptyBase64, $scope.Confirm.Tobk1.TempBase64)) {
                            $scope.signature = 'data:image/png;base64,' + $scope.Confirm.Tobk1.TempBase64;
                        }
                    }
                }
            });
        });

        function resizeCanvas() {
            var ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth - 50;
            canvas.height = screen.height / 3;
        }
        var getSignature = function () {

        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {});
        };
        $scope.returnDetail = function () {
            $state.go('jobListingDetail', {
                'key': $scope.Confirm.Tobk1.Key,
                'LineItemNo': $scope.Confirm.Tobk1.LineItemNo
            }, {
                reload: true
            });
        };
        $scope.clearCanvas = function () {
            $scope.signature = null;
            signaturePad.clear();
        };
        $scope.saveCanvas = function () {
            var sigImg = signaturePad.toDataURL();
            if (is.not.equal(strEemptyBase64, sigImg)) {
                $scope.signature = sigImg;
            }
        };

        $scope.confirm = function () {
            // if ($scope.OnBehalfOfItem.NewItem === 'CustomerCode') {
            //     $scope.Confirm.Tobk1.OnBehalfName = "";
            // } else {
            //     $scope.Confirm.Tobk1.OnBehalfName = $scope.OnBehalfOfItem.BehalfName;
            // }

            $scope.saveCanvas();
            var signature = '';
            if (is.not.null($scope.signature)) {
                signature = $scope.signature.split(',')[1];
            }
            var UpdatedValue = 'Y';
            if (!ENV.fromWeb) {
                if ($cordovaNetwork.isOffline()) {
                    ENV.wifi = false;
                    UpdatedValue = 'N';
                } else {
                    ENV.wifi = true;
                }
            }
            var Tobk1Filter = "Key='" + $scope.Confirm.Tobk1.Key + "' and LineItemNo='" + $scope.Confirm.Tobk1.LineItemNo + "'and TableName='" + $scope.Confirm.Tobk1.TableName + "' "; // not record
            var objTobk1 = {
                StatusCode: 'POD',
                TempBase64: signature,
                UpdatedFlag: UpdatedValue,
                FilterTime: moment(new Date()).format('YYYYMMDD'),
                OnBehalfName: $scope.Confirm.Tobk1.OnBehalfName
            };
            SqlService.Update('Tobk1', objTobk1, Tobk1Filter).then(function (res) {});
            if (UpdatedValue === 'Y') {
                var objUri = ApiService.Uri(true, '/api/tms/tobk1/confirm');
                objUri.addSearch('TableName', $scope.Confirm.Tobk1.TableName);
                // objUri.addSearch('OnBehalfName', $scope.Confirm.Tobk1.OnBehalfName);
                objUri.addSearch('Remark', $scope.Confirm.Tobk1.Remark);
                objUri.addSearch('Key', $scope.Confirm.Tobk1.Key);
                objUri.addSearch('LineItemNo', $scope.Confirm.Tobk1.LineItemNo);
                objUri.addSearch('JobNo', $scope.Confirm.Tobk1.JobNo);
                objUri.addSearch('DCDescription', $scope.Confirm.Tobk1.DCFlag);
                objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                ApiService.Get(objUri, true).then(function success(result) {});
                var jsonData = {
                    'Base64': $scope.signature,
                    'FileName': $scope.Confirm.Tobk1.Key + '_' + $scope.Confirm.Tobk1.LineItemNo + '.Png'
                };
                if ($scope.signature !== null && is.not.equal($scope.signature, '') && is.not.undefined($scope.signature)) {
                    objUri = ApiService.Uri(true, '/api/tms/upload/img');
                    objUri.addSearch('Key', $scope.Confirm.Tobk1.Key);
                    objUri.addSearch('TableName', $scope.Confirm.Tobk1.TableName);
                    ApiService.Post(objUri, jsonData, true).then(function success(result) {});
                }
            }
            PopupService.Info(null, 'Confirm Success', '').then(function (res) {
                $scope.returnList();
            });
        };
        getSignature();
        resizeCanvas();

        strEemptyBase64 = signaturePad.toDataURL();

    }
]);

app.controller('UploadCtrl', ['ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'FileUploader', 'ApiService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, $ionicPopup, FileUploader, ApiService, PopupService) {
        $scope.UploadPhoto = {
            Key: $stateParams.Key,
            TableName: $stateParams.TableName
        };
        $scope.returnDoc = function () {
            $state.go('jobListingDetail', {
                'key': $scope.UploadPhoto.Key
            }, {
                reload: true
            });
        };
        var uri = '';
        uri = ApiService.Uri(true, '/api/tms/upload/img');
        uri.addSearch('Key', $scope.UploadPhoto.Key);
        uri.addSearch('TableName', $scope.UploadPhoto.TableName);
        var uploader = $scope.uploader = new FileUploader({
            url: ApiService.Url(uri)
        });
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            PopupService.Info(null, 'Upload Successfully', '').then(function (res) {
                $scope.returnDoc();
            });
        };
    }
]);
