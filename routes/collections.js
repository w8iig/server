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

    db.boards.getBoardsByCollectionId(collectionId, function(boards_get_error, get_boards) {
      if (boards_get_error) {
        // ignore error
      }

      var boards = [];
      for (var i = get_boards.length - 1; i >= 0; i--) {
        boards.push(db.boards.prepare(get_boards[i]));
      };

      res.render('collections/view', {
        title: collection.collectionName,
        collection: db.collections.prepare(collection),
        boards: boards
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
  ctx.fillText("Yay!", 50, 100);

  var te = ctx.measureText('Yay!');
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