
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
  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('config', config);
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

// sondh@2012-11-10
// temporary disable socket.io transports limitation
if (process.env.PORT && false) {
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    
    console.log('socket.io set to use xhr-polling only (detected environment variable: PORT)');
  });
}

app.get(config.echo.route, require('./routes/echo').route);
app.get(config.bonsai.route, require('./routes/bonsai').route);

app.get('/', function(req, res) {
  res.render('index');
});

app.get(config.collections.routeIndex, require('./routes/collections').routeIndex);
app.get(config.collections.routeView, require('./routes/collections').routeView);
app.get(config.collections.routeThumbnail, require('./routes/collections').routeThumbnail);
app.get(config.boards.routeIndex, require('./routes/boards').routeIndex);
app.get(config.boards.routeView, require('./routes/boards').routeView);
app.get(config.boards.routeThumbnail, require('./routes/boards').routeThumbnail);

app.post(config.api.collections.routeIndex, require('./routes/api/collections').routeIndexPost);
app.get(config.api.collections.routeIndex, require('./routes/api/collections').routeIndexGet);
app.get(config.api.collections.routeView, require('./routes/api/collections').routeView);
app.post(config.api.boards.routeIndex, require('./routes/api/boards').routeIndex);
app.get(config.api.boards.routeView, require('./routes/api/boards').routeView);
app.post(config.api.media.routeIndex, require('./routes/api/media').routeIndex);
app.post(config.api.media.routeImageUpload, require('./routes/api/media').routeImageUpload);

server.listen(app.get('config').port, function(){
  console.log("Express server listening on port " + app.get('config').port);
});

var ioEcho = io.of(config.echo.route).on('connection', function (socket) {
  socket.on(config.echo.messageFromClient, function (data) {
    data.socketId = socket.id;
    ioEcho.emit(config.echo.messageFromServer, data);
    console.log(data);
  });
});

var ioBonsai = io.of(config.bonsai.route).on('connection', function (socket) {
  socket.on(config.bonsai.messageFromClient, function (data) {
    data.socketId = socket.id;
    socket.broadcast.emit(config.bonsai.messageFromServer, data);
  });
});

var ioMediaHandler = require('./routes/media').socketHandler;
var ioMediaInternalHandler = require('./routes/media').internalHandler;
var ioMedia = io.of(config.media.routeIndex).on('connection', function(socket) {
  ioMediaHandler(ioMedia, socket);
});
require('./routes/api/media').newMediaEmitter.on(config.media.messageInternalUpdate, function(data) {
  ioMediaInternalHandler(ioMedia, data);
});

