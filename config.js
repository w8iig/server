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

exports.boards = {
  routePrefix: '/boards/',
  routeIndex: '/boards',
  routeView: '/boards/:boardId'
};

exports.errors = {
  db_boards_null:       10101,
  
  db_insert_error:      10201,
  db_find_error:        10202,
  db_count_error:       10203
};

exports.phrases = {
  boards:               'Boards',
  boards_new_unable:    'Unable to create new board',
  boards_get_error:     'An error has occured while attempting to get board data from database',
  
  unknown_error:        'An unknown error has occured'
};