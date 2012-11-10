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

exports.routeImageUpload = function(req, res) {
  if (typeof req.files.image == 'undefined') {
    res.send(403, { error: config.phrases.media_image_upload_image_required, code: 0});
    return;
  }

  var uploadedImage = req.files.image;
  var ext = uploadedImage.name.substr(-4).toLowerCase();

  if (uploadedImage.size == 0
    || (
      ext != '.png'
      && ext != '.jpg'
      && ext != '.gif'
    )) {
    console.log(uploadedImage, ext);
    res.send(403, { error: config.phrases.media_image_upload_image_only, code: 0});
    return;
  }

  // TODO: we should do better here to avoid overwriting existing files
  // probably some kind of counter and/or mixed date values?
  var outputPath = config.api.media.outputDirectory + '/' + uploadedImage.name;

  require('fs').rename(uploadedImage.path, __dirname + '/../..' + outputPath, function(error) {
    console.log(error);

    res.send({
      url: outputPath
    });
  });
}
