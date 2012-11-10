var socket = io.connect(window.location);
var myIcon = [
				{"icon":":boss:","src":"http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/boss.png"},
				{"icon":":beat:","src":"http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/beat_shot.png"},
				{"icon":":smile:","src":"http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/big_smile.png"},
				{"icon":":beauty:","src":"http://vozforums.com/images/smilies/Off/beauty.gif"},
			 ];
socket.on(app.config.echo.messageFromServer, function (data) {
  var div = $('<div class="message" />')
	.append($('<div class="author" />').text(data.socketId));
  var token = data.message.split(" ");
  
  for(i = 0; i< token.length;i++){
	  for(j = 0 ;j < myIcon.length; j++){
		if(myIcon[j].icon == token[i]){
			div.append('<img src="'+myIcon[j].src+'"> ');
			break;
		}
	  }
	if(j>=myIcon.length)
	div.append(' '+token[i]+' ');
  }
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