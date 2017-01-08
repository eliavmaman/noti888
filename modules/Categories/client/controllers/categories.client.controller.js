'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Categories', '$http',
    function ($scope, $stateParams, $location, Authentication, Categories, $http) {
        $scope.authentication = Authentication;
        $scope.tags = [];
        $scope.savedCategory = null;
        $http.get('cids').then(function (res) {
            var data = res;
            console.log(data);
        })
        // Create new Category
        $scope.create = function (isValid) {
            $scope.error = null;

            //if (!isValid) {
            //  $scope.$broadcast('show-errors-check-validity', 'articleForm');
            //
            //  return false;
            //}

            // Create new Category object
            var category = new Categories({
                name: this.name,
                tags: []
            });

            // Redirect after save
            category.$save(function (response) {
                //$scope.savedCategory = response;
                $location.path('categories/' + response._id + '/edit');

                // Clear form fields
                $scope.title = '';
                $scope.tags = [];
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Category
        $scope.remove = function (category) {
            if (category) {
                category.$remove();

                for (var i in $scope.categories) {
                    if ($scope.categories[i] === category) {
                        $scope.categories.splice(i, 1);
                    }
                }
            } else {
                $scope.category.$remove(function () {
                    $location.path('categories');
                });
            }
        };

        // Update existing Category
        $scope.update = function (isValid) {
            $scope.error = null;

            //if (!isValid) {
            //    $scope.$broadcast('show-errors-check-validity', 'articleForm');
            //
            //    return false;
            //}

            var category = $scope.category;

            category.$update(function () {
                $location.path('categories/' + category._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Categories
        $scope.find = function () {
            $scope.categories = Categories.query();
        };

        // Find existing Category
        $scope.findOne = function () {
            $scope.category = Categories.get({
                categoryId: $stateParams.categoryId
            });
        };

        $scope.addTag = function () {
            if (this.newTag !== '') {
                $scope.tags.push(this.newTag);

                if ($scope.category) {
                    $scope.category.tags.push({name: this.newTag, category: $scope.category._id, messages: []});
                }
            }
        }
    }
]);
