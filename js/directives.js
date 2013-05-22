'use strict';

/* Directives */

wk_app.
directive('draggable', function($document) {
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;
    var width = jQuery('.map').width();
    var height = jQuery('.map').height();
    var type;

    if (scope['seat']) {
      type = 'seat';
    }
    else if (scope['room']) {
      type = 'room';
    }

    element.bind('mousedown', function(event) {
      width = jQuery('.map').width();
      height = jQuery('.map').height();
      x = width * parseFloat(element.css('left').split('%')[0])/100;
      y = height * parseFloat(element.css('top').split('%')[0])/100;
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.screenX - x;
      startY = event.screenY - y;
      $document.bind('mousemove', mousemove);
      $document.bind('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.screenY - startY;
      x = event.screenX - startX;
      if (x < 0) {
        x = 0;
      }
      if (x > width) {
        x = width;
      }
      if (y < 0) {
        y = 0;
      }
      if (y > height) {
        y = height;
      }

      element.css({
        top: y + 'px',
        left:  x + 'px'
      });
    }

    function mouseup() {
      scope[type].top = (y/height)*100 + "%";
      scope[type].left = (x/width)*100 + "%";
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
    }
  }
});

wk_app.
directive('deletable', function($document) {
  return function(scope, element, attr) {
    element.bind('mousedown', function(event) {
      scope.deleteRoom(scope);
    });
  }
});
