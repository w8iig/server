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
          }); // stage.on('message:from-outside',...

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
                  break;
                case 'image':
                  displayObject = new Bitmap(mediaSingle.src).on('load', function() {
                    this.addTo(stage);
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
                displayObject.closePath();
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
        width: 500,
        height: 500
      }); // canvas = bonsai.setup(...)
    });
  })(jQuery);
}