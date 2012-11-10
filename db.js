var mongoskin = require('mongoskin');

var config = require('./config');
var collections = null;
var boards = null;
var mongodb = mongoskin.db(config.mongodb_url, { safe: true }).open(function(err, db) {
  console.log('mongodb is connected');

  collections = mongodb.bind('collections');
  exports.collections.count(function(_, numberOfCollections) {
    console.log('mongodb.collections: count = %d', numberOfCollections);
  });
  
  boards = mongodb.bind('boards');
  exports.boards.count(function(_, numberOfBoards) {
    console.log('mongodb.boards: count = %d', numberOfBoards);
  });
});

exports.boards = {
  prepare: function(board) {
    return {
      boardId: board.boardId,
      collectionId: board.collectionId,
      created: board.created
    };
  },

  create: function(collectionId, callback) {
    // callback = function(err, board) {};
    if (boards == null) {
      callback(config.errors.db_boards_null, null);
      console.warn('mongodb: boards collection is null');
      return;
    }
    
    notExports.boards.generateBoardId(function(generate_error, newBoardId) {
      if (generate_error) {
        callback(generate_error, '');
        return;
      }
      
      var newBoard = {
        boardId: newBoardId,
        collectionId: new mongodb.ObjectID(collectionId),
        created: Math.round(new Date().getTime() / 1000)
      };

      boards.insert(newBoard, {}, function(insert_error, insert_results) {
        if (insert_error) {
          callback(config.errors.db_insert_error, insert_result);
          console.warn('mongodb.boards: insert error (%s)', insert_error.message);
          return;
        }

        callback(0, insert_results[0]);
        console.log('mongodb.boards: inserted board %s (id = %s)', newBoardId, insert_results[0]._id);
      });
    });
  },
  
  count: function(callback) {
    // callback = function(err, numberOfBoards) {};
    if (boards == null) {
      callback(config.errors.db_boards_null, null);
      console.warn('mongodb: boards collection is null');
      return;
    }
    
    boards.find().count(function(count_error, numberOfBoards) {
      if (count_error) {
        callback(config.errors.db_count_error, 0);
        console.warn('mongodb.boards: count error (%s)', count_error.message);
        return;
      }
      
      callback(0, numberOfBoards);
    });
  },
  
  getAll: function(callback) {
    // callback = function(err, boards) {};
    if (boards == null) {
      callback(config.errors.db_boards_null, null);
      console.warn('mongodb: boards collection is null');
      return;
    }
    
    boards.find().toArray(function(find_error, find_results) {
      if (find_error) {
        callback(config.errors.db_find_error, 0);
        console.warn('mongodb.boards: find error (%s)', count_error.message);
        return;
      }
      
      callback(0, find_results);
    });
  },
  
  getBoardById: function(boardId, callback) {
    // callback = function(err, boardObject) {};
    if (boards == null) {
      callback(config.errors.db_boards_null, null);
      console.warn('mongodb: boards collection is null');
      return;
    }
    
    boards.find({ boardId: boardId }).limit(2).toArray(function(find_error, find_results) {
      if (find_error) {
        callback(config.errors.db_find_error, null);
        console.warn('mongodb.boards: find error (%s)', find_error.message);
        return;
      }
      
      if (find_results.length == 1) {
        callback(0, find_results[0]);
      } else {
        callback(0, null);
      }
    });
  },

  getBoardsByCollectionId: function(collectionId, callback) {
    // callback = function(err, boards) {};
    if (boards == null) {
      callback(config.errors.db_boards_null, null);
      console.warn('mongodb: boards collection is null');
      return;
    }
    
    boards.find({ collectionId: new mongodb.ObjectID(collectionId) }).toArray(function(find_error, find_results) {
      if (find_error) {
        callback(config.errors.db_find_error, null);
        console.warn('mongodb.boards: find error (%s)', find_error.message);
        return;
      }
      
      callback(0, find_results);
    });
  }
};

exports.collections = {
  prepare: function(collection) {
    return {
      collectionId: collection._id,
      collectionName: collection.collectionName
    };
  },

  create: function(collectionName, callback) {
    // callback = function(err, newCollectionId) {};
    if (collections == null) {
      callback(config.errors.db_collections_null, null);
      console.warn('mongodb: collections collection is null');
      return;
    }

    collections.insert({ collectionName: collectionName }, {}, function(insert_error, insert_results) {
      if (insert_error) {
        callback(config.errors.db_insert_error, null);
        console.warn('mongodb.collections: insert error (%s)', insert_error.message);
        return;
      }

      callback(0, insert_results[0]);
    });
  },

  count: function(callback) {
    // callback = function(err, numberOfCollections) {};
    if (collections == null) {
      callback(config.errors.db_collections_null, 0);
      console.warn('mongodb: collections collection is null');
      return;
    }
    
    collections.find().count(function(count_error, numberOfCollections) {
      if (count_error) {
        callback(config.errors.db_count_error, 0);
        console.warn('mongodb.collections: count error (%s)', count_error.message);
        return;
      }
      
      callback(0, numberOfCollections);
    });
  },
  
  getAll: function(callback) {
    // callback = function(err, collections) {};
    if (collections == null) {
      callback(config.errors.db_collections_null, []);
      console.warn('mongodb: collections collection is null');
      return;
    }
    
    collections.find().toArray(function(find_error, find_results) {
      if (find_error) {
        callback(config.errors.db_find_error, 0);
        console.warn('mongodb.collections: find error (%s)', count_error.message);
        return;
      }
      
      callback(0, find_results);
    });
  },
  
  getCollectionById: function(collectionId, callback) {
    // callback = function(err, collectionObject) {};
    if (collections == null) {
      callback(config.errors.db_collections_null, null);
      console.warn('mongodb: collections collection is null');
      return;
    }
    
    collections.find({ _id: new mongodb.ObjectID(collectionId) }).limit(2).toArray(function(find_error, find_results) {
      if (find_error) {
        callback(config.errors.db_find_error, 0);
        console.warn('mongodb.collections: find error (%s)', count_error.message);
        return;
      }
      
      if (find_results.length == 1) {
        callback(0, find_results[0]);
      } else {
        callback(0, null);
      }
    });
  }
};

var notExports = {
  boards: {
    generateBoardId: function(callback) {
      // callback = function(err, newBoardId) {};
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      
      var random = '';
      while (random.length < 6) {
        random += chars.substr(Math.floor(Math.random() * (chars.length - 1)), 1);
      }
      
      exports.boards.getBoardById(random, function(get_error, get_result) {
        if (get_error) {
          callback(get_error, '');
          return;
        }
        
        if (get_result == null) {
          callback(0, random);
          console.log('mongodb.boards: generated board id = %s', random);
          return;
        }
        
        // found some existing board with the random id, continue...
        notExports.boards.generateBoardId(callback);
      });
    }
  }
};