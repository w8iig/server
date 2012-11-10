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
    
    res.render('boards/view', {
      title: board.boardId,
      board: db.boards.prepare(board)
    });
  });
};