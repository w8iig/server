
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , expose = require('express-expose');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var config = require('./config');

app.configure(function(){
  app.expose({ config: config });
  
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

app.get(config.echo.route, require('./routes/echo').route);
app.get(config.bonsai.route, require('./routes/bonsai').route);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var ioEcho = io.of(config.echo.route).on('connection', function (socket) {
  socket.on(config.echo.messageFromClient, function (data) {
    data.socketId = socket.id;
    ioEcho.emit(config.echo.messageFromServer, data);
  });
});

var ioBonsai = io.of(config.bonsai.route).on('connection', function (socket) {
  socket.on(config.bonsai.messageFromClient, function (data) {
    data.socketId = socket.id;
    socket.broadcast.emit(config.bonsai.messageFromServer, data);
  });
});