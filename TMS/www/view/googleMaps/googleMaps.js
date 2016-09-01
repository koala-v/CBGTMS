'use strict';
app.controller('GoogleMapCtrl', function($scope, $state, $cordovaGeolocation) {
//  var options = {timeout: 10000, enableHighAccuracy: true};

  var mapOptions = {
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.TERRAIN
      }

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  $scope.geocoder =new google.maps.Geocoder();

  $scope.infoWindow = new google.maps.InfoWindow();

  var codeAddress = function() {
      $scope.geocoder.geocode({ 'address': '' }, function(results, status) {
          if(status == google.maps.GeocoderStatus.OK) {
              $scope.map.setCenter(results[0].geometry.location);
              this.marker =new google.maps.Marker({
                  title: '',
                  map: $scope.map,
                  position:results[0].geometry.location
              });
              $scope.infowindow =new google.maps.InfoWindow({
                  content: "Here I am!"
              });
              $scope.infowindow.open($scope.map, marker);
          }
      });
  };
codeAddress();
var latLng;
$cordovaGeolocation.getCurrentPosition(mapOptions).then(function(position){

    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

     mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  }, function(error){
    console.log("Could not get location");
  });
  google.maps.event.addListenerOnce($scope.map, 'idle', function(){

  var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: latLng
  });
});


google.maps.event.addListenerOnce($scope.map, 'idle', function(){

  var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: latLng
  });

  var infoWindow = new google.maps.InfoWindow({
      content: "Here I am!"
  });

  google.maps.event.addListener(marker, 'click', function () {
      infoWindow.open($scope.map, marker);
  });

});
});
