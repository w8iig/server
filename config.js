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
  routeView: '/collections/:collectionId',
  routeThumbnail: '/collections/:collectionId/thumbnail'
};

exports.boards = {
  routeIndex: '/boards',
  routeView: '/boards/:boardId',
  routeThumbnail: '/boards/:boardId/thumbnail',
};

exports.media = {
  routeIndex: '/media',

  messageSubscribe: 'media-subscribe', // data = boardId
  messageFromServerError: 'media-error', // data = message (error=?, code=?)
  messageFromServerNotifyUniqueId: 'media-notify-unique-id',
  messageUpdate: 'media-update', // data = media data
  messageInternalUpdate: 'media-internal-update', // data = media data
  messageFromServerUpdate: 'media-server-update', // data = media data

}

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
    routeIndex: '/api/media',
    routeImageUpload: '/api/media/image-upload',

    outputDirectory: '/uploaded-image'
  }
};

exports.errors = {
  db_boards_null:       10101,
  db_collections_null:  10102,
  db_media_null:        10103,
  
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
  media_new_requires_identifier_counter:              'identifier and counter are required',
  media_parse_unable:                                 'Unable to determine media type and information',
  media_insert_unable:                                'Unable to insert media to board',
  media_update_not_subscribed:                        'Subscription is required before accepting update requests',
  media_update_counter_is_required:                   'counter is required to update media, just use an self-increased integer!',
  media_image_upload_image_required:                  'Image upload (image) is required',
  media_image_upload_image_only:                      'Only images are allowed',

  unknown_error:                                      'An unknown error has occured'
};