if (app && app.config && app.board) {
  var socket = io.connect(app.config.media.routeIndex);
  var canvas = null;

  (function($){
    $(document).ready(function(){
      socket.on('connect', function() {
        socket.emit(app.config.media.messageSubscribe, app.board.boardId);

        socket.on(app.config.media.messageFromServerError, function (data) {
          if (canvas != null) {
            canvas.sendMessage('from-outside', {
              event: app.config.media.messageFromServerError,
              data: data
            });
          } else {
            console.warn('canvas is null (event = %s)', app.config.media.messageFromServerError);
          }
        });

        socket.on(app.config.media.messageFromServerNotifyUniqueId, function (data) {
          if (canvas != null) {
            canvas.sendMessage('from-outside', {
              event: app.config.media.messageFromServerNotifyUniqueId,
              data: data
            });
          } else {
            console.warn('canvas is null (event = %s)', app.config.media.messageFromServerNotifyUniqueId);
          }
        });

        socket.on(app.config.media.messageFromServerUpdate, function (data) {
          if (canvas != null) {
            canvas.sendMessage('from-outside', {
              event: app.config.media.messageFromServerUpdate,
              data: data
            });
          } else {
            console.warn('canvas is null (event = %s)', app.config.media.messageFromServerUpdate);
          }
        });

        setupCanvasListener();
      });

      var setupCanvasListener = function() {
        canvas.on('message:from-inside', function(dataFromInside) {
          if (socket) {
            socket.emit(dataFromInside.event, dataFromInside.data);
          }
        });

        canvas.on('message:from-inside-youtube', function(dataFromInside) {
          var elementId = 'youtube_' + dataFromInside.counter;
          var $iframe = $('#' + elementId);

          if ($iframe.length == 0) {
            $iframe = $('<iframe />');
          }

          $iframe.attr('id', elementId);
          $iframe.css('position', 'absolute')
            .css('left', dataFromInside.media.x + 'px')
            .css('top', dataFromInside.media.y + 'px')
            .css('-moz-transform', 'rotate(' + dataFromInside.media.rotation + 'deg)')
            .css('-webkit-transform', 'rotate(' + dataFromInside.media.rotation + 'deg)')
            .css('-o-transform', 'rotate(' + dataFromInside.media.rotation + 'deg)')
            .css('-ms-transform', 'rotate(' + dataFromInside.media.rotation + 'deg)');
          $iframe.attr('src', 'http://www.youtube.com/embed/' + dataFromInside.media.id);
          $iframe.attr('width', dataFromInside.media.width);
          $iframe.attr('height', dataFromInside.media.height);

          $('#canvasContainer').append($iframe);
        });

        // force draw media loaded on page load
        if (app.media) {
          for (var i = app.media.length - 1; i >= 0; i--) {
            canvas.sendMessage('from-outside', {
              event: app.config.media.messageFromServerUpdate,
              data: app.media[i]
            });
          };
        }
      }
      
      canvas = bonsai.setup({
        // runnerContext: bonsai.IframeRunnerContext
      }).run(document.getElementById('canvas'), {
        code: function() {
          var counter = 0;
          var media = {};
          var counterByUniqueId = {};
          var displayObjects = {};
          
          stage.on('message:from-outside', function(dataFromOutside) {
            var event = dataFromOutside.event;
            var data = dataFromOutside.data;

            switch (event) {
              case 'media-server-update':
                if (data.uniqueId) {
                  if (typeof counterByUniqueId[data.uniqueId] == 'undefined') {
                    // this is a new media
                    media[counter] = data;
                    counterByUniqueId[data.uniqueId] = counter;
                    counter++;
                  } else {
                    // this is an old one
                    media[counterByUniqueId[data.uniqueId]] = data;
                  }

                  drawMediaByCounter(counterByUniqueId[data.uniqueId]);
                } else {
                  // do not process with incomplete media data
                }
                break;
              case 'media-notify-unique-id':
                if (typeof media[data.counter] != 'undefined') {
                  media[data.counter].uniqueId = data.uniqueId;
                }
                break;
              case 'media-error':
                console.error(data);
                break;
            }
          }); // stage.on('message:from-outside',...

          var currentPaths = {};
          var currentCounters = {};
          var pathDataFromDisplayObject = function(curentCounter, path) {
            var absolutePoints = path.points();
            var relativePoints = [];
            for (var i = absolutePoints.length - 1; i > 0; i--) {
              relativePoints.push({
                x: absolutePoints[i][0] - absolutePoints[0][0],
                y: absolutePoints[i][1] - absolutePoints[0][1]
              });
            };

            c = color(path.attr('strokeColor'));
            hex = '#' + String(c).substr(2, 6);

            var data = {
              type: 'path',
              x: absolutePoints[0][0],
              y: absolutePoints[0][1],
              rotation: 0,
              relativePoints: relativePoints,
              thickness: path.attr('strokeWidth'),
              color: hex,
              counter: curentCounter
            };

            if (typeof media[curentCounter] != 'undefined' && typeof media[curentCounter].uniqueId != 'undefined') {
              data.uniqueId = media[curentCounter].uniqueId;
            }

            return data;
          }
          stage.on('multi:pointerdown', function(e) {
            if (currentPaths[e.touchId] == null) {
              currentPaths[e.touchId] = new Path().moveTo(e.stageX, e.stageY).stroke('red', 3);
              currentPaths[e.touchId].addTo(stage);
              setupMediaDraggable(counter, currentPaths[e.touchId]);
              currentCounters[e.touchId] = counter;
              counter++;
            }
          });
          stage.on('multi:pointerup', function(e) {
            if (typeof currentPaths[e.touchId] != 'undefined' && currentPaths[e.touchId] != null) {
              media[currentCounters[e.touchId]] = pathDataFromDisplayObject(currentCounters[e.touchId], currentPaths[e.touchId]);
              displayObjects[currentCounters[e.touchId]] = currentPaths[e.touchId];

              currentPaths[e.touchId] = null
            }
          });
          stage.on('multi:drag', function(e) {
            if (typeof currentPaths[e.touchId] != 'undefined' && currentPaths[e.touchId] != null) {
              var data = pathDataFromDisplayObject(currentCounters[e.touchId], currentPaths[e.touchId]);
              media[currentCounters[e.touchId]] = data;
              displayObjects[currentCounters[e.touchId]] = currentPaths[e.touchId];

              currentPaths[e.touchId].lineTo(e.stageX, e.stageY);

              stage.sendMessage('from-inside', {
                event: 'media-update',
                data: data
              });
            }            
          });

          var setupMediaDraggable = function(mediaCounter, displayObject) {
            var touch1 = null;
            var touch2 = null;

            displayObject.on('multi:pointerdown', function(e) {
              if (touch1 == null) {
                touch1 = {
                  touchId: e.touchId,
                  x: e.stageX,
                  y: e.stageY
                };
              } else if (touch2 == null) {
                touch2 = {
                  touchId: e.touchId,
                  x: e.stageX,
                  y: e.stageY
                }
              }
            });

            displayObject.on('multi:pointerup', function(e) {
              if (touch1 != null && touch1.touchId == e.touchId) {
                if (touch2 != null) {
                  touch1 = {
                    touchId: touch2.touchId,
                    x: touch2.x,
                    y: touch2.y
                  };  
                } else {
                  touch1 = null;
                }
                
                touch2 = null;
              } else if (touch2 != null && touch2.touchId == e.touchId) {
                touch2 = null;
              }
            });

            displayObject.on('multi:drag', function(e) {
              if (touch1 != null && touch2 == null && touch1.touchId == e.touchId) {
                // moving
                var x = parseInt(displayObject.attr('x')) + e.stageX - touch1.x;
                var y = parseInt(displayObject.attr('y')) + e.stageY - touch1.y;

                displayObject.attr('x', x);
                displayObject.attr('y', y);

                touch1.x = e.stageX;
                touch1.y = e.stageY;

                media[mediaCounter].x = x;
                media[mediaCounter].y = y;

                drawMediaByCounter(mediaCounter);

                var data = media[mediaCounter];
                data.counter = mediaCounter;
                stage.sendMessage('from-inside', {
                  event: 'media-update',
                  data: data
                });
              } else if (touch1 != null && touch2 != null) {
                // pinching
                var xBefore = (touch1.x + touch2.x) / 2;
                var yBefore = (touch1.y + touch2.y) / 2;
                var distanceBefore = Math.sqrt(
                  Math.pow(touch1.x - touch2.x, 2)
                  + Math.pow(touch1.y - touch2.y, 2)
                );
                var alphaBefore = Math.atan((touch1.y - touch2.y) / (touch1.x - touch2.x));
                
                if (e.touchId == touch1.touchId) {
                  touch1.x = e.stageX;
                  touch1.y = e.stageY;
                } else if (e.touchId == touch2.touchId) {
                  touch2.x = e.stageX;
                  touch2.y = e.stageY;
                }
                var xAfter = (touch1.x + touch2.x) / 2;
                var yAfter = (touch1.y + touch2.y) / 2;
                var distanceAfter = Math.sqrt(
                  Math.pow(touch1.x - touch2.x, 2)
                  + Math.pow(touch1.y - touch2.y, 2)
                );
                var alphaAfter = Math.atan((touch1.y - touch2.y) / (touch1.x - touch2.x));

                var newX = parseInt(displayObject.attr('x')) + xAfter - xBefore;
                var newY = parseInt(displayObject.attr('y')) + yAfter - yBefore;
                var newRotation = parseDouble(displayObject.attr('rotation')) + alphaAfter - alphaBefore;
                var newWidth = null;
                var newHeight = null;
                
                displayObject.attr('x', newX);
                displayObject.attr('y', newY);
                displayObject.attr('rotation', newRotation);

                if (media[mediaCounter].type == 'image'
                  && distanceAfter > 0) {
                  newWidth = parseInt(displayObject.attr('width')) * distanceAfter / distanceBefore;
                  newHeight = parseInt(displayObject.attr('height')) * distanceAfter / distanceBefore;

                  displayObject.attr('width', newWidth);
                  displayObject.attr('height', newHeight);
                }

                media[mediaCounter].x = newX;
                media[mediaCounter].y = newY;
                media[mediaCounter].rotation = newRotation;

                if (media[mediaCounter].type == 'image'
                  && newWidth != null) {
                  media[mediaCounter].width = newWidth;
                  media[mediaCounter].height = newHeight;
                }

                drawMediaByCounter(mediaCounter);

                var data = media[mediaCounter];
                data.counter = mediaCounter;
                stage.sendMessage('from-inside', {
                  event: 'media-update',
                  data: data
                });
              }
            });
          };

          var drawMediaByCounter = function(mediaCounter) {
            var mediaSingle = media[mediaCounter];
            if (typeof mediaSingle == 'undefined') return; // media not found?

            var displayObject = displayObjects[mediaCounter];
            if (typeof displayObject == 'undefined') {
              // this is a brand new media (never drawn before)
              // we have to create a new display object for it
              switch (mediaSingle.type) {
                case 'path':
                  displayObject = new Path();
                  displayObject.addTo(stage);
                  setupMediaDraggable(mediaCounter, displayObject);
                  break;
                case 'image':
                  displayObject = new Bitmap(mediaSingle.src).on('load', function() {
                    this.addTo(stage);
                    setupMediaDraggable(mediaCounter, this);
                  });
                  break;
                case 'youtube':
                  displayObject = {
                    counter: mediaCounter,
                    media: mediaSingle
                  }
                  break;
              }

              displayObjects[mediaCounter] = displayObject;
            }

            // update media data
            switch (mediaSingle.type) {
              case 'path':
                displayObject.clear();
                displayObject.moveTo(mediaSingle.x, mediaSingle.y);
                for (var i = mediaSingle.relativePoints.length - 1; i >= 0; i--) {
                  displayObject.lineTo(mediaSingle.relativePoints[i].x + mediaSingle.x, mediaSingle.relativePoints[i].y + mediaSingle.y);
                };
                displayObject.stroke(mediaSingle.color, mediaSingle.thickness);
                break;
              case 'image':
                displayObject.attr('x', mediaSingle.x);
                displayObject.attr('y', mediaSingle.y);
                displayObject.attr('rotation', mediaSingle.rotation);
                break;
              case 'youtube':
                displayObject.media = mediaSingle;
                stage.sendMessage('from-inside-youtube', displayObject);
                break;
            }
          }; // var drawMediaByCounter = ...
        },
        width: 2000,
        height: 2000
      }); // canvas = bonsai.setup(...)
    });
  })(jQuery);
}