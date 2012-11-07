var socket = io.connect(window.location.hostname);

socket.on('echo-echo', function (data) {
  var div = $('<div />').text(data.message);
  $('#output').prepend(div);
});

(function($){
  $(document).ready(function(){
  	$('#button').click(function(e){
  	  socket.emit('echo-message', { message: $('#message').val() });
  	  $('#message').val('');
  	  e.preventDefault();
  	});
  });
})(jQuery);