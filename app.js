
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
var db = require('./db');

app.configure(function(){
  app.expose({ config: config });
  
  app.set('port', config.port);
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

if (process.env.PORT) {
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    
    console.log('socket.io set to use xhr-polling only (detected environment variable: PORT)');
  });
}

app.get(config.echo.route, require('./routes/echo').route);
app.get(config.bonsai.route, require('./routes/bonsai').route);

app.get('/', require('./routes/boards').routeRoot);
app.get(config.boards.routeIndex, require('./routes/boards').routeIndex);
app.get(config.boards.routeView, require('./routes/boards').routeView);

app.post(config.api.collections.routeIndex, require('./routes/api/collections').routeIndexPost);
app.get(config.api.collections.routeIndex, require('./routes/api/collections').routeIndexGet);

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