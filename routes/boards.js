var config = require('../config');
var db = require('../db');

exports.routeRoot = function(req, res) {
  db.boards.create(function(err, boardId) {
    if (err) {
      res.render('error', { message: config.phrases.boards_new_unable, code: err });
      return;
    }
    
    res.redirect(config.boards.routePrefix + boardId);
  });
};

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
      boards = get_boards;
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
    
    res.render('boards/view', {
      title: board.boardId,
      board: board
    });
  });
};