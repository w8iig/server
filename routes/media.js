var config = require('../config');
var db = require('../db');
var mediaTypes = require('../media_types');

exports.socketHandler = function(sockets, socket) {
  var boardId = false;

  socket.on(config.media.messageSubscribe, function(newBoardId) {
    if (boardId != null) {
      socket.leave(boardId);
      boardId = false;
    }
    
    socket.join(newBoardId);
    boardId = newBoardId;
    console.info('%s joined %s', socket.id, boardId);
  });

  socket.on(config.media.messageUpdate, function(updateData) {
    if (boardId == false) {
      socket.emit(config.media.messageFromServerMessage, {
        error: config.phrases.media_update_not_subscribed,
        code: 0
      });
      return;
    } else if (typeof updateData.counter == 'undefined') {
      socket.emit(config.media.messageFromServerMessage, {
        error: config.phrases.media_update_counter_is_required,
        code: 0
      });
      return;
    } else {
      var mediaObject = mediaTypes.create(updateData);
      if (mediaObject == null) {
        socket.emit(config.media.messageFromServerMessage, {
          error: config.phrases.media_parse_unable,
          code: 0
        });
        return;
      }

      var uniqueId = updateData.uniqueId;
      if (typeof uniqueId == 'undefined') {
        // this is a new media, we have to generate the uniqueid using some identifier
        // in this case, just use the socket id
        uniqueId = mediaTypes.generateUniqueId(socket.id, updateData.counter);

        // now update the unique id to the owner
        socket.emit(config.media.messageFromServerNotifyUniqueId, {
          counter: updateData.counter,
          uniqueId: uniqueId
        });
      }

      // broadcast the media update
      var serverUpdateData = mediaObject.toJson();
      serverUpdateData.uniqueId = uniqueId;

      var roomSockets = sockets.clients(boardId);
      for (socketId in roomSockets) {
        if (socketId == socket.id) continue; // do not emit update back to the source socket
        roomSockets[socketId].emit(config.media.messageFromServerUpdate, serverUpdateData);
      }

      db.media.insert(boardId, uniqueId, mediaObject.toJson());
    }
  });
};

exports.internalHandler = function(sockets, internalUpdateData) {
  var boardId = internalUpdateData.boardId;
  var serverUpdateData = internalUpdateData;

  sockets.in(boardId).emit(config.media.messageFromServerUpdate, serverUpdateData);
};