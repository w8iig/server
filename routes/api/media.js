var config = require('../../config');
var db = require('../../db');
var mediaTypes = require('../../media_types');
var events = require('events');

exports.newMediaEmitter = new events.EventEmitter();

exports.routeIndex = function(req, res) {
  var boardId = req.body.board_id;
  var identifier = req.body.identifier;
  var counter = req.body.counter;

  if (!boardId) {
    res.send(403, { error: config.phrases.media_new_requires_board_id, code: 0 });
    return;
  }

  if (!identifier || !counter) {
    res.send(403, { error: config.phrases.media_new_requires_identifier_counter, code: 0 });
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

    var media = mediaTypes.create(req.body);

    if (media == null) {
      res.send(403, { error: config.phrases.media_parse_unable, code: 0 });
      return;
    }

    db.media.insert(boardId, mediaTypes.generateUniqueId(identifier, counter), media.toJson(), function(insert_error, insert_media) {
      if (insert_error) {
        res.send(500, { error: config.phrases.boards_insert_unable, code: insert_error });
        return;
      }

      var data = db.media.prepare(insert_media);

      exports.newMediaEmitter.emit(config.media.messageInternalUpdate, data);

      res.send(data);
    });
  });
};