(function($) {
  $(document).ready(function() {
    var canvas = bonsai.setup({
      runnerContext: bonsai.IframeRunnerContext
    }).run(document.getElementById('canvas'), {
      code: function() {
        var shapes = [];
        
        stage.on('message:fromOutside', function(dataFromOutside) {
          console.log(dataFromOutside);
        });
        
        var newCircle = function() {
          var c = new Circle(0, 0, 100);
          setupDO(c);
          c.addTo(stage)
          shapes.push(c);
          
          return c;
        }
        
        var setupDO = function(displayObj) {
          displayObj.fill('red')
            .stroke('black', 3);
          
          ['addedToStage', '_displayObjectChanged'].forEach(function(eventName) {
            displayObj.on(eventName, function(e) {
              stage.sendMessage('fromInside', {
                type: 'event',
                'eventName': eventName,
                'eventInfo': e
              });
            });
          });
          
          var state = {
            firstTouch: {
              touchId: false,
              x: 0, y: 0, pointerX: 0, pointerY: 0
            },
            secondTouch: {
              touchId: false,
              pointerX: 0, pointerY: 0
            },
            touches: 0
          };
          
          displayObj.once('pointerdown', function(e) {
            newCircle();
          });
          
          displayObj.on('multi:pointerdown', function(e) {
            if (state.touches == 0) {
              state.firstTouch.touchId = e.touchId;
              state.firstTouch.x = e.stageX;
              state.firstTouch.y = e.stageY;
              state.touches = 1;
              console.log('pointerdown 1');
            } else if (state.touches == 1) {
              state.secondTouch.touchId = e.touchId;
              state.secondTouch.x = e.stageX;
              state.secondTouch.y = e.stageY;
              state.touches = 2;
              console.log('pointerdown 2');
            }
          });
          
          displayObj.on('multi:pointerup', function(e) {
            if (state.touches == 1) {
              state.touches = 0;
              console.log('pointerup 1');
            } else if (state.touches == 2) {
              if (state.firstTouch.touchId == e.touchId) {
                // the first touch has just been released, we have to move
                // the second one to be the first touch
                state.firstTouch.touchId = state.secondTouch.touchId;
                state.firstTouch.x = state.secondTouch.x;
                state.firstTouch.y = state.secondTouch.y;
                state.touches = 1;
                console.log('pointerup #1');
              } else if (state.secondTouch.touchId == e.touchId) {
                // the second one has just been released, just decrease the counter
                state.touches = 1;
                console.log('pointerup #2');
              }
            }
          });
          
          displayObj.on('multi:drag', function(e) {
            if (state.touches == 1 && e.touchId == state.firstTouch.touchId) {
              displayObj.attr('x', displayObj.attr('x') + e.stageX - state.firstTouch.x);
              displayObj.attr('y', displayObj.attr('y') + e.stageY - state.firstTouch.y);
              
              state.firstTouch.x = e.stageX;
              state.firstTouch.y = e.stageY;
              
              console.log('drag 1');
              displayObj.emit('_displayObjectChanged', {
                x: displayObj.attr('x'),
                y: displayObj.attr('y'),
                width: displayObj.attr('radius'),
                height: displayObj.attr('radius')
              });
            } else if (state.touches == 2) {
              var xBefore = (state.firstTouch.x + state.secondTouch.x) / 2;
              var yBefore = (state.firstTouch.y + state.secondTouch.y) / 2;
              var distanceBefore = Math.sqrt(
                Math.pow(state.firstTouch.x - state.secondTouch.x, 2)
                + Math.pow(state.firstTouch.y - state.secondTouch.y, 2)
              );
              
              if (e.touchId == state.firstTouch.touchId) {
                state.firstTouch.x = e.stageX;
                state.firstTouch.y = e.stageY;
                console.log('drag #1');
              } else if (e.touchId == state.secondTouch.touchId) {
                state.secondTouch.x = e.stageX;
                state.secondTouch.y = e.stageY;
                console.log('drag #2');
              }
              var xAfter = (state.firstTouch.x + state.secondTouch.x) / 2;
              var yAfter = (state.firstTouch.y + state.secondTouch.y) / 2;
              var distanceAfter = Math.sqrt(
                Math.pow(state.firstTouch.x - state.secondTouch.x, 2)
                + Math.pow(state.firstTouch.y - state.secondTouch.y, 2)
              );
              
              displayObj.attr('x', displayObj.attr('x') + xAfter - xBefore);
              displayObj.attr('y', displayObj.attr('y') + yAfter - yBefore);
              displayObj.attr('radius', displayObj.attr('radius') * distanceAfter / distanceBefore);
              displayObj.emit('_displayObjectChanged', {
                x: displayObj.attr('x'),
                y: displayObj.attr('y'),
                width: displayObj.attr('radius'),
                height: displayObj.attr('radius')
              });
            }
          });
        }
        
        newCircle();
      },
      width: $(window).width(),
      height: $(window).height()
    });
    
    canvas.on('load', function() {
      canvas.on('message:fromInside', function(dataFromInside) {
        if (dataFromInside.type == 'event') {
          switch (dataFromInside.eventName) {
            case '_displayObjectChanged':
              console.log(
                dataFromInside.eventName,
                dataFromInside.eventInfo.x,
                dataFromInside.eventInfo.y,
                dataFromInside.eventInfo.width,
                dataFromInside.eventInfo.height
              );
              break;
            default:
              console.log(dataFromInside.eventName);
          }
        } else {
          console.log(dataFromInside);
        }
      });
    });
  });
})(jQuery);