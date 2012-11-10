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

        if (canvas != null) {
          canvas.on('message:from-inside', function(dataFromInside) {
            if (socket) {
              socket.emit(dataFromInside.event, dataFromInside.data);
            }
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
      });
      
      canvas = bonsai.setup({
        // runnerContext: bonsai.IframeRunnerContext
      }).run(document.getElementById('canvas'), {
        code: function() {
          var counter = 0;
          var media = {};
          var counterByUniqueId = {};
          var shapes = {};
          
          stage.on('message:from-outside', function(dataFromOutside) {
            var event = dataFromOutside.event;
            var data = dataFromOutside.data;
            console.log('event', event, data);

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
          });

          var drawMediaByCounter = function(mediaCounter) {
            var mediaSingle = media[mediaCounter];
            if (typeof mediaSingle == 'undefined') return; // media not found?

            var shape = shapes[mediaCounter];
            if (typeof shape == 'undefined') {
              // this is a brand new media (never drawn before)
              // we have to create a new shape object for it
              switch (mediaSingle.type) {
                case 'path':
                  shape = new Path();
                  break;
              }

              shape.addTo(stage);
              shapes[mediaCounter] = shape;
            }

            // update media data
            switch (mediaSingle.type) {
              case 'path':
                shape.clear();
                shape.moveTo(mediaSingle.x, mediaSingle.y);
                for (var i = mediaSingle.relativePoints.length - 1; i >= 0; i--) {
                  shape.lineTo(mediaSingle.relativePoints[i].x + mediaSingle.x, mediaSingle.relativePoints[i].y + mediaSingle.y);
                };
                shape.closePath();
                shape.stroke(mediaSingle.color, mediaSingle.thickness);
                break;
            }
          };
        },
        width: 500,
        height: 500
      });
    });
  })(jQuery);
}