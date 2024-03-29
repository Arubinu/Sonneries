/* ng-infinite-scroll - v1.0.0 - 2013-12-16 */
var mod;
mod = angular.module('infinite-scroll', []);
mod.directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
        link: function(scope, elem, attrs) {
            var $scrollParent, checkWhenEnabled, elementTop, handler, scrollDistance, scrollEnabled;
            $window = angular.element($window);

            scrollDistance = 0;
            if (attrs.infiniteScrollDistance != null) {
                scope.$watch(attrs.infiniteScrollDistance, function(value) {
                    return scrollDistance = parseInt(value, 10);
                });
            }
            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.infiniteScrollDisabled != null) {
                scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }
            elementTop = 0;
            handler = function() {
                var elementBottom, remaining, scrollBottom, shouldScroll;
                elementBottom = elementTop + elem[0].offsetHeight;
                scrollBottom = angular.element(elem).parent()[0].offsetHeight + angular.element(elem).parent()[0].scrollTop;
                remaining = elementBottom - scrollBottom;
                shouldScroll = remaining <= angular.element(elem).parent()[0].offsetHeight * scrollDistance;

                if (shouldScroll && scrollEnabled) {
                    if ($rootScope.$$phase) {
                        return scope.$eval(attrs.infiniteScroll);
                    } else {
                        return scope.$apply(attrs.infiniteScroll);
                    }
                } else if (shouldScroll) {
                    return checkWhenEnabled = true;
                }
            };
            angular.element(elem).parent().on('scroll', handler);
            scope.$on('$destroy', function() {
                return angular.element(elem).parent().off('scroll', handler);
            });
            return $timeout((function() {
                if (attrs.infiniteScrollImmediateCheck) {
                    if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                        return handler();
                    }
                } else {
                    return handler();
                }
            }), 0);
        }
    };
}]);
