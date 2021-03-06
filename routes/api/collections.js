var config = require('../../config');
var db = require('../../db');

exports.routeIndexPost = function(req, res) {
  var collectionName = req.body.collection_name;

  if (!collectionName) {
    res.send(403, { error: config.phrases.collections_new_requires_name, code: 0 });
    return;
  }

  db.collections.create(collectionName, function(create_error, collection) {
    if (create_error) {
      res.send(500, { error: config.phrases.collections_new_unable, code: create_error });
      return;
    }

    var data = db.collections.prepare(collection);

    res.send(data);
  });
};

exports.routeIndexGet = function(req, res) {
  db.collections.getAll(function(find_error, collections) {
    if (find_error) {
      res.send(500, { error: config.phrases.collections_get_unable, code: find_error });
      return;
    }

    var data = [];
    for (var i = collections.length - 1; i >= 0; i--) {
      data.push(db.collections.prepare(collections[i]));
    };

    res.send(data);
  });
};

exports.routeView = function(req, res) {
  var collectionId = req.params.collectionId;

  if (!collectionId) {
    res.send(403, { error: config.phrases.collections_get_requires_id, code: 0 });
    return;
  }

  db.collections.getCollectionById(collectionId, function(get_error, collection) {
    if (get_error) {
      res.send(500, { error: config.phrases.collections_get_unable, code: get_error });
      return;
    }

    if (collection == null) {
      res.send(404, { error: config.phrases.collection_not_found, code: 0 });
      return;
    }

    var data = db.collections.prepare(collection);
    data.boards = [];

    db.boards.getBoardsByCollectionId(collectionId, function(boards_get_error, boards) {
      if (boards_get_error) {
        // ignore error
      }

      for (var i = boards.length - 1; i >= 0; i--) {
        data.boards.push(db.boards.prepare(boards[i]));
      };

      res.send(data);
    });
  });
};