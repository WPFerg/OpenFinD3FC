(function() {
    'use strict';

    /**
     * Responsible for starting the application, and sending events to the child windows.
     */
    class ParentCtrl {
        constructor($scope, storeService, windowCreationService) {
            windowCreationService.ready(() => {
                var previousWindows = storeService.getPreviousOpenWindowNames(),
                    length = previousWindows.length,
                    i,
                    max;

                var hideWindow = () => fin.desktop.Window.getCurrent().hide();
                if (length !== 0) {
                    // Restoring previously open windows
                    for (i = 0; i < length; i++) {
                        var name = previousWindows[i];
                        windowCreationService.createMainWindow(name, storeService.open(name).isCompact(), hideWindow);
                    }
                } else {
                    // Creating new window
                    windowCreationService.createMainWindow(undefined, undefined, hideWindow);
                }

                $scope.$on('updateFavourites', (event, stock, windowName) => {
                    var e = new Event('updateFavourites');
                    e.stock = stock;
                    var openWindow = windowCreationService.getWindow(windowName);
                    openWindow.getNativeWindow().dispatchEvent(e);
                });
            });
        }
    }
    ParentCtrl.$inject = ['$scope', 'storeService', 'windowCreationService'];

    angular.module('stockflux.parent')
        .controller('ParentCtrl', ParentCtrl);
}());
