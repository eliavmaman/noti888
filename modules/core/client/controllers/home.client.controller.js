'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Categories', '$http',
    function ($scope, Authentication, Categories, $http) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.selectedCat = null;

        $scope.find = function () {
            $scope.categories = Categories.query();
        };

        $scope.selectedTag = function (tag) {

            $http.get('/api/articles/byTag/' + tag._id).then(function (res) {
                $scope.articles = res.data;
            });
        }
    }
]);
