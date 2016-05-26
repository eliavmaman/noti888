'use strict';

angular.module('core').controller('UserCategoriesController', ['$scope', 'Authentication', 'Categories', '$http', 'Users',
    function ($scope, Authentication, Categories, $http, Users) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.selectedCat = null;
        $scope.user = Authentication.user;

        $scope.find = function () {
            $scope.categories = Categories.query();
        };

        $scope.isTagExist = function (tag) {
            var isExist = false;
            $scope.user.tags.forEach(function (t) {
                if (t._id.toString() === tag._id.toString()) {
                    isExist = true;
                }
            });

            return isExist;
        };


        $scope.addTag = function (tag) {
            $scope.user.tags.push(tag);
            updateUser();
        };
        $scope.removeTag = function (index) {
            $scope.user.tags.splice(index, 1);
            updateUser();
        };

        function updateUser() {
            var user = new Users($scope.user);

            user.$update(function (response) {
                //$scope.$broadcast('show-errors-reset', 'userForm');
                toastr.info('user tags were updated');
                $scope.success = true;
                $scope.user=response;
                Authentication.user = response;
            }, function (response) {
                $scope.error = response.data.message;
            });
        }
    }
]);
