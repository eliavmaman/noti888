'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Categories',
    function ($scope, $stateParams, $location, Authentication, Categories) {
        $scope.authentication = Authentication;
        $scope.tags = [];
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
                tags: $scope.tags
            });

            // Redirect after save
            category.$save(function (response) {
                $location.path('categories/' + response._id);

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

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'articleForm');

                return false;
            }

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
                    $scope.category.tags.push(this.newTag);
                }
            }
        }
    }
]);
