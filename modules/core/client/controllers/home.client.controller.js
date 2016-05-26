'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Categories',
    function ($scope, Authentication, Categories) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.selectedCat = null;

        $scope.find = function () {
            $scope.categories = Categories.query();
        };
    }
]);
