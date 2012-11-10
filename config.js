exports.port = process.env.PORT || 29690;
exports.mongodb_url = process.env.MONGOHQ_URL || 'localhost:27017/w8iig';

exports.echo = {
  route: '/echo',
  messageFromClient: 'echo-message',
  messageFromServer: 'echo-echo'
};

exports.bonsai = {
  route: '/bonsai',
  messageFromClient: 'bonsai-message',
  messageFromServer: 'bonsai-echo'
};

exports.collections = {
  routeIndex: '/collections',
  routeView: '/collections/:collectionId'
};

exports.boards = {
  routeIndex: '/boards',
  routeView: '/boards/:boardId'
};

exports.api = {
  collections: {
    routeIndex: '/api/collections',
    routeView: '/api/collections/:collectionId'
  },
  boards: {
    routeIndex: '/api/boards',
    routeView: '/api/boards/:boardId'
  },
  media: {
    routeIndex: '/api/media'
  }
};

exports.errors = {
  db_boards_null:       10101,
  db_collections_null:  10102,
  
  db_insert_error:      10201,
  db_find_error:        10202,
  db_count_error:       10203
};

exports.phrases = {
  boards:                                             'Boards',
  boards_new_unable:                                  'Unable to create new board',
  boards_new_requires_collection_id:                  'collection_id is required',
  boards_get_error:                                   'An error has occured while attempting to get board data from database',
  boards_get_requires_id:                             'board_id is required',
  board_not_found:                                    'The requested board could not be found',

  collections:                                        'Collections',
  collections_new_unable:                             'Unable to create new collection',
  collections_new_requires_name:                      'collection_name is required',
  collections_get_unable:                             'An error has occured while attempting to get collection data from database',
  collections_get_requires_id:                        'collection_id is required',
  collection_not_found:                               'The requested collection could not be found',

  media_new_requires_board_id:                        'board_id is required',
  
  unknown_error:                                      'An unknown error has occured'
};