(function(window) {
    'use strict';

    angular.module('openfin.tearout', ['openfin.geometry', 'openfin.hover', 'openfin.store'])
        .directive('tearable', ['geometryService', 'hoverService', 'storeService', function(geometryService, hoverService, storeService) {
            return {
                restrict: 'C',
                link: function(scope, element, attrs) {
                    // TODO: Improve this. Search for first class element upwards?
                    var dragElement = element[0],
                        tearElement = dragElement.parentNode.parentNode,
                        tileWidth = tearElement.clientWidth,
                        tileHeight = tearElement.clientHeight;

                    function createConfig() {
                        return {
                            'name': scope.stock.code + ' window',
                            'maxWidth': tileWidth,
                            'minHeight': tileHeight,
                            'defaultWidth': tileWidth,
                            'defaultHeight': tileHeight,
                            'width': tileWidth,
                            'height': tileHeight,
                            'autoShow': false,
                            'url': 'sidebars/favourites/tearout.html',
                            'frame': false,
                            'resizable': false,
                            'maximizable': false,
                            'showTaskbarIcon': false,
                            'saveWindowState': false
                        };
                    }

                    fin.desktop.main(function() {
                        function initialiseTearout() {
                            dragElement.draggable = false;
                            hoverService.add(tearElement, scope.stock.code);

                            // Helper function to retrieve the height, width, top, and left from a window object
                            function getWindowPosition(windowElement) {
                                return {
                                    height: windowElement.outerHeight,
                                    width: windowElement.outerWidth,
                                    top: windowElement.screenY,
                                    left: windowElement.screenX
                                };
                            }

                            // Calculate the screen position of an element
                            function elementScreenPosition(element1) {
                                var relativeElementPosition = element1.getBoundingClientRect();

                                return {
                                    height: relativeElementPosition.height,
                                    width: relativeElementPosition.width,
                                    top: relativeElementPosition.top,
                                    left: relativeElementPosition.left
                                };
                            }

                            var initialOpacity = 1;

                            tearElement.addEventListener('dragstart', function(event) {
                                initialOpacity = event.target.style.opacity || 1;
                                event.dataTransfer.effectAllowed = 'move';
                            });

                            tearElement.addEventListener('drag', function(event) {
                                // Set opacity here so the drag image doesn't appear even more faded.
                                event.target.style.opacity = 0.4;
                                var hoverTargets = hoverService.get();

                                for (var i = 0, max = hoverTargets.length; i < max; i++) {
                                    var dropTargetRectangle = geometryService.rectangle(
                                        elementScreenPosition(hoverTargets[i].hoverArea));

                                    var boundingBox = dragElement.getBoundingClientRect();
                                    var mousePosition = {
                                        top: event.clientY,
                                        left: event.clientX,
                                        width: boundingBox.width,
                                        height: boundingBox.height
                                    };
                                    var overDropTarget = geometryService.rectangle(mousePosition)
                                            .intersects(dropTargetRectangle);

                                    if (overDropTarget) {
                                        // TODO: This is where the pause will go, and the highlighting.
                                        storeService.reorder(scope.stock.code, hoverTargets[i].code);
                                        break;
                                    }
                                }
                            });

                            tearElement.addEventListener('dragend', function(event) {
                                event.target.style.opacity = initialOpacity;
                                var x = event.screenX;
                                var y = event.screenY;
                                console.log(x, y);
                                // var screenCoords = desktopService.getWindowLocation();
                                // if (x < screenCoords.x || y < screenCoords.y ||
                                //     x > (screenCoords.x + screenCoords.width) ||
                                //     y > (screenCoords.y + screenCoords.height)) {
                                //
                                //     /**
                                //      * TODO: decide whether or not to dock into another open window
                                //      *       or create a new one
                                //      */
                                // }
                            });

                            // Only make the tear element tearable when the mouse is over the
                            // tearable anchor.
                            dragElement.addEventListener('mouseover', function() {
                                tearElement.draggable = true;
                            });

                            dragElement.addEventListener('mouseout', function() {
                                tearElement.draggable = false;
                            });
                        }

                        scope.$on('$destroy', function(e) {
                            hoverService.remove(scope.stock.code);
                        });

                        initialiseTearout();
                    });
                }
            };
        }]);
}(window));
