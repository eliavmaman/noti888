'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Categories', '$http',
    function ($scope, Authentication, Categories, $http) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.user = Authentication.user;
        $scope.selectedTag = null;

        $scope.find = function () {
            $scope.tags = $scope.user.tags;
        };

        $scope.addNewMessage = function () {
            if ($scope.newMessage != '') {
                var msgObj = {text: $scope.newMessage, user: $scope.user._id};
                $http.post('api/categories/' + $scope.selectedTag.category + '/tags/' + $scope.selectedTag._id + '/message', msgObj).then(function (res) {
                    $scope.meassges = res.data;
                });
            }
        };
        $scope.setSelectedTag = function (tag) {

            Categories.get({
                categoryId: tag.category
            }).$promise.then(function (res) {
                $scope.category = res;
                $scope.selectedTag = _.find($scope.category.tags, function (t) {
                    return t._id.toString() === tag._is.toString();
                });
            });
        };

        $scope.getTagMessages = function (tag) {
            $scope.selectedTag=tag;
            $http.get('api/categories/' + tag.category + '/tags/' + tag._id).then(function (res) {
                $scope.meassges = res.data;
            });
        };


    }
]);
