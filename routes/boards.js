var config = require('../config');
var db = require('../db');

exports.routeIndex = function(req, res) {
  var count = 0;
  var boards = [];
  
  var getCount = function(callback) {
    db.boards.count(function(count_error, numberOfBoards) {
      // intentianally ignore error
      count = numberOfBoards;
      callback();
    });
  };
  
  var getBoards = function(callback) {
    db.boards.getAll(function(get_error, get_boards) {
      // intentionally ignore error
      for (var i = get_boards.length - 1; i >= 0; i--) {
        boards.push(db.boards.prepare(get_boards[i]));
      };
      callback();
    });
  };
  
  getCount(function() {
    getBoards(function() {
      res.render('boards/list', {
        title: config.phrases.boards,
        count: count,
        boards: boards
      });
    });
  });
};

exports.routeView = function(req, res) {
  db.boards.getBoardById(req.params.boardId, function(err, board) {
    if (err) {
      res.render('error', { message: config.phrases.boards_get_error, code: err });
      return;
    }

    if (board == null) {
      res.render('error', { message: config.phrases.board_not_found, code: 0 });
      return;
    }

    var board = db.boards.prepare(board);
    var media = [];

    db.media.getMediaByBoardId(board.boardId, function(media_get_error, mediaMany) {
      if (media_get_error) {
        // ignore error
      }

      for (var i = mediaMany.length - 1; i >= 0; i--) {
        media.push(db.media.prepare(mediaMany[i]));
      };

      res.expose({ board: board });
      res.expose({ media: media });
      res.render('boards/view', {
        title: board.boardId,
        board: db.boards.prepare(board)
      });
    });
  });
};

exports.routeThumbnail = function(req, res) {
  var Canvas = require('canvas')
    , canvas = new Canvas(200, 200)
    , ctx = canvas.getContext('2d');

  ctx.font = '30px Impact';
  ctx.rotate(.1);
  ctx.fillText("Awesome!", 50, 100);

  var te = ctx.measureText('Awesome!');
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + te.width, 102);
  ctx.stroke();
 
  canvas.toBuffer(function(error, buffer) {
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  });
};