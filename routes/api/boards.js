var config = require('../../config');
var db = require('../../db');

exports.routeIndex = function(req, res) {
  var collectionId = req.body.collection_id;

  if (!collectionId) {
    res.send(403, { error: config.phrases.boards_new_requires_collection_id, code: 0 });
    return;
  }

  db.boards.create(collectionId, function(create_error, board) {
    if (create_error) {
      res.send(500, { error: config.phrases.boards_new_unable, code: create_error });
      return;
    }

    var data = db.boards.prepare(board);

    res.send(data);
  });
};

exports.routeView = function(req, res) {
  var boardId = req.params.boardId;

  if (!boardId) {
    res.send(403, { error: config.phrases.boards_get_requires_id, code: 0 });
    return;
  }

  db.boards.getBoardById(boardId, function(get_error, board) {
    if (get_error) {
      res.send(500, { error: config.phrases.boards_get_unable, code: get_error });
      return;
    }

    if (board == null) {
      res.send(404, { error: config.phrases.board_not_found, code: 0 });
      return;
    }

    var data = db.boards.prepare(board);
    data.media = [];

    db.media.getMediaByBoardId(boardId, function(media_get_error, mediaMany) {
      if (media_get_error) {
        // ignore error
      }

      for (var i = mediaMany.length - 1; i >= 0; i--) {
        data.media.push(db.media.prepare(mediaMany[i]));
      };

      res.send(data);
    });
  });
};