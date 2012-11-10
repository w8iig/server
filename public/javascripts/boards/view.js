if (app && app.config && app.board) {
  var socket = io.connect(app.config.media.routeIndex);

  socket.on(app.config.media.messageFromServerError, function (data) {
    console.log(app.config.media.messageFromServerError, data);
  });

  socket.on(app.config.media.messageFromServerNotifyUniqueId, function (data) {
    console.log(app.config.media.messageFromServerNotifyUniqueId, data);
  });

  socket.on(app.config.media.messageFromServerUpdate, function (data) {
    console.log(app.config.media.messageFromServerUpdate, data);
  });

  (function($){
    $(document).ready(function(){
      socket.on('connect', function() {
        socket.emit(app.config.media.messageSubscribe, app.board.boardId);
      });
    });
  })(jQuery);
}