(function($) {
  $(document).ready(function() {
    var socket = io.connect(window.location);
    
    var canvas = bonsai.setup({
      // runnerContext: bonsai.IframeRunnerContext
    }).run(document.getElementById('canvas'), {
      code: function() {
        var shapes = [];
        
        stage.on('message:fromOutside', function(dataFromOutside) {
          if (typeof shapes[dataFromOutside._displayObjectId] == 'undefined') {
            // this is a new display object
            var o = null;

            switch (dataFromOutside._displayObjectType) {
              case 'Circle':
                o = new Circle(
                  dataFromOutside.eventInfo.x,
                  dataFromOutside.eventInfo.y,
                  dataFromOutside.eventInfo.radius
                ).fill('red').stroke('black', 1);
                o._type = 'Circle';
                break;
              case 'Rect':
                o = new Rect(
                  dataFromOutside.eventInfo.x,
                  dataFromOutside.eventInfo.y,
                  dataFromOutside.eventInfo.width,
                  dataFromOutside.eventInfo.height
                ).fill('green').stroke('black', 1);
                o.attr('rotation', dataFromOutside.eventInfo.rotation);
                o._type = 'Rect';
                break;
            }
            
            if (o !== null) {
              o._id = dataFromOutside._displayObjectId;
              setupDO(o);
            }
          } else {
            var o = shapes[dataFromOutside._displayObjectId];
            
            switch (o._type) {
              case 'Circle':
                o.attr('x', dataFromOutside.eventInfo.x);
                o.attr('y', dataFromOutside.eventInfo.y);
                o.attr('radius', dataFromOutside.eventInfo.radius);
                break;
              case 'Rect':
                o.attr('x', dataFromOutside.eventInfo.x);
                o.attr('y', dataFromOutside.eventInfo.y);
                o.attr('width', dataFromOutside.eventInfo.width);
                o.attr('height', dataFromOutside.eventInfo.height);
                o.attr('rotation', dataFromOutside.eventInfo.rotation);
                break;
            }
          }
        });
        
        var newCircle = function() {
          var c = new Circle(0, 0, 100).fill('red').stroke('black', 1);
          c._type = 'Circle';
          setupDO(c);
          return c;
        }
        
        var newRect = function() {
          var r = new Rect(-100, 200, 200, 100).fill('green').stroke('black', 1);
          r._type = 'Rect';
          setupDO(r);
          return r;
        }
        
        var generateGUID = function() {
            var S4 = function () {
              return Math.floor(
                Math.random() * 0x10000 /* 65536 */
              ).toString(16);
            };

            return (
              S4() + S4() + "-" +
              S4() + "-" +
              S4() + "-" +
              S4() + "-" +
              S4() + S4() + S4()
            );
        }
        
        var setupDO = function(displayObj) {
          ['addedToStage', '_displayObjectChanged'].forEach(function(eventName) {
            displayObj.on(eventName, function(e) {
              stage.sendMessage('fromInside', {
                type: 'event',
                'eventName': eventName,
                'eventInfo': e,
                '_displayObjectType': displayObj._type,
                '_displayObjectId': displayObj._id
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
            var changed = false;
            if (state.touches == 1 && e.touchId == state.firstTouch.touchId) {
              displayObj.attr('x', displayObj.attr('x') + e.stageX - state.firstTouch.x);
              displayObj.attr('y', displayObj.attr('y') + e.stageY - state.firstTouch.y);
              
              state.firstTouch.x = e.stageX;
              state.firstTouch.y = e.stageY;
              
              console.log('drag 1');
              changed = true;
            } else if (state.touches == 2) {
              var xBefore = (state.firstTouch.x + state.secondTouch.x) / 2;
              var yBefore = (state.firstTouch.y + state.secondTouch.y) / 2;
              var distanceBefore = Math.sqrt(
                Math.pow(state.firstTouch.x - state.secondTouch.x, 2)
                + Math.pow(state.firstTouch.y - state.secondTouch.y, 2)
              );
              var alphaBefore = Math.atan((state.firstTouch.y - state.secondTouch.y) / (state.firstTouch.x - state.secondTouch.x));
              
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
              var alphaAfter = Math.atan((state.firstTouch.y - state.secondTouch.y) / (state.firstTouch.x - state.secondTouch.x));
              
              displayObj.attr('x', displayObj.attr('x') + xAfter - xBefore);
              displayObj.attr('y', displayObj.attr('y') + yAfter - yBefore);
              if (displayObj._type == 'Circle') {
                displayObj.attr('radius', displayObj.attr('radius') * distanceAfter / distanceBefore);
              } else if (displayObj._type == 'Rect') {
                displayObj.attr('width', displayObj.attr('width') * distanceAfter / distanceBefore);
                displayObj.attr('height', displayObj.attr('height') * distanceAfter / distanceBefore);
                displayObj.attr('rotation', displayObj.attr('rotation') + alphaAfter - alphaBefore);
              }
              changed = true;
            }
            
            var eventInfo = {
              x: displayObj.attr('x'),
              y: displayObj.attr('y')
            };
            if (displayObj._type == 'Circle') {
              eventInfo.radius = displayObj.attr('radius');
            } else if (displayObj._type == 'Rect') {
              eventInfo.width = displayObj.attr('width');
              eventInfo.height = displayObj.attr('height');
              eventInfo.rotation = displayObj.attr('rotation');
            }            
            displayObj.emit('_displayObjectChanged', eventInfo);
          });
          
          if (typeof displayObj._id == 'undefined') {
            displayObj._id = generateGUID();
            
            displayObj.once('pointerdown', function(e) {
              if (displayObj._type == 'Circle') {
                newCircle();
              } else if (displayObj._type == 'Rect') {
                newRect();
              }
            });
          }
          
          displayObj.addTo(stage);
          shapes[displayObj._id] = displayObj;
        }
        
        newCircle();
        newRect();
      },
      width: $(window).width(),
      height: $(window).height()
    });
    
    canvas.on('message:fromInside', function(dataFromInside) {
      if (dataFromInside.type == 'event') {
        switch (dataFromInside.eventName) {
          default:
            console.log(
              dataFromInside.eventName,
              dataFromInside._displayObjectType,
              dataFromInside._displayObjectId
            );
        }
        
        if (dataFromInside.eventName == '_displayObjectChanged') {
          socket.emit(app.config.bonsai.messageFromClient, dataFromInside);
        }
      } else {
        console.log(dataFromInside);
      }
    });
    
    socket.on(app.config.bonsai.messageFromServer, function(dataFromServer) {
      canvas.sendMessage('fromOutside', dataFromServer);
    });
    
  });
})(jQuery);