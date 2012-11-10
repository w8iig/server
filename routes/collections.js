var config = require('../config');
var db = require('../db');

exports.routeIndex = function(req, res) {
  var count = 0;
  var collections = [];
  
  var getCount = function(callback) {
    db.collections.count(function(count_error, numberOfCollections) {
      // intentianally ignore error
      count = numberOfCollections;
      callback();
    });
  };
  
  var getCollections = function(callback) {
    db.collections.getAll(function(get_error, get_collections) {
      // intentionally ignore error
      for (var i = get_collections.length - 1; i >= 0; i--) {
        collections.push(db.collections.prepare(get_collections[i]));
      };
      callback();
    });
  };
  
  getCount(function() {
    getCollections(function() {
      res.render('collections/list', {
        title: config.phrases.collections,
        count: count,
        collections: collections
      });
    });
  });
};

exports.routeView = function(req, res) {
  var collectionId = req.params.collectionId;

  if (!collectionId) {
    res.render('error', { message: config.phrases.collections_get_requires_id, code: 0 });
    return;
  }

  db.collections.getCollectionById(collectionId, function(err, collection) {
    if (err) {
      res.render('error', { message: config.phrases.collections_get_error, code: err });
      return;
    }

    if (collection == null) {
      res.render('error', { message: config.phrases.collection_not_found, code: 0 });
      return;
    }
    
    res.render('collections/view', {
      title: collection.collectionName,
      collection: db.collections.prepare(collection)
    });
  });
};