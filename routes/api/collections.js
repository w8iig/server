var config = require('../../config');
var db = require('../../db');

exports.routeIndexPost = function(req, res) {
  var collectionName = req.body.collection_name;

  if (!collectionName) {
    res.send(403, { error: config.phrases.collections_new_requies_name, code: 0 });
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
      data.push({
        collectionId: collections[i]._id,
        collectionName: collections[i].collectionName
      });
    };

    res.send(data);
  });
};