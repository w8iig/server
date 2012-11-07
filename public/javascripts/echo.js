var socket = io.connect(window.location);

socket.on(app.config.echo.messageFromServer, function (data) {
  var div = $('<div class="message" />')
    .append($('<div class="author" />').text(data.socketId))
    .append($('<div class="text" />').text(data.message));
  $('#output').prepend(div);
});

(function($){
  $(document).ready(function(){
    var $message = $('#message');
    var $submit = $('#submit');
    
    $message.focus();
    
    $submit.click(function(e){
      var message = $message.val();
      if (message) {
        socket.emit(app.config.echo.messageFromClient, { message: message });
        $message.val('');
      }
      e.preventDefault();
    });
  });
})(jQuery);