'use strict';
app.controller('SplashCtrl',
    ['$state', '$timeout',
    function ($state, $timeout) {
        $timeout(function () {
            $state.go('index.login', {}, { reload: true });
        }, 1500);
    }]);
