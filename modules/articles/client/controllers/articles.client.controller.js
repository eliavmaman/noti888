'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles', 'Categories','$http',
    function ($scope, $stateParams, $location, Authentication, Articles, Categories,$http) {
        $scope.authentication = Authentication;

        // Create new Article
        $scope.selectedTag = '';
        $scope.categories = Categories.query();
        $scope.create = function (isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'articleForm');

                return false;
            }

            // Create new Article object
            var article = new Articles({
                title: this.title,
                content: this.content,
                tag:{
                    _id:$scope.selectedTag._id,
                    name:$scope.selectedTag.name,
                    category:$scope.selectedTag.category
                }
            });

            // Redirect after save
            article.$save(function (response) {
                $http.get('/api/articles/notify/'+$scope.selectedTag._id).then(function(res){
                    toastr.info('article notification sent');
                },function(err){
                    toastr.error('article notification failed');
                });

                $location.path('articles/' + response._id);

                // Clear form fields
                $scope.title = '';
                $scope.content = '';
                $scope.selectedTag=null;
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Article
        $scope.remove = function (article) {
            if (article) {
                article.$remove();

                for (var i in $scope.articles) {
                    if ($scope.articles[i] === article) {
                        $scope.articles.splice(i, 1);
                    }
                }
            } else {
                $scope.article.$remove(function () {
                    $location.path('articles');
                });
            }
        };

        // Update existing Article
        $scope.update = function (isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'articleForm');

                return false;
            }

            var article = $scope.article;

            article.$update(function () {
                $location.path('articles/' + article._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Articles
        $scope.find = function () {
            $scope.articles = Articles.query();
        };

        // Find existing Article
        $scope.findOne = function () {
            $scope.article = Articles.get({
                articleId: $stateParams.articleId
            });
        };
    }
]);
