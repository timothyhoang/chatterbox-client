// YOUR CODE HERE:
app = {};

app.init = function() {
  this.server = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages';
  this.username = location.search.split('=')[1];
  this.chatrooms = {};
  this.friends = {};
  this.currentChatroom = 'lobby';
  this.autoUpdate();
};

app.send = function(message) {
  $.ajax({
    type: 'POST',
    url: app.server,
    data: message,
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  var app = this;
  
  $.ajax({
    type: 'GET',
    url: app.server,
    data: { limit: 500, order: '-createdAt'},
    dataType: 'json',
    success: function (data) {
      console.log('chatterbox: Data retrieved');
      app.clearMessages.bind(app)();
      app.renderMessages.bind(app)(data.results);
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve data', data);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessages = function(messages) {
  for (message of messages) {
    var roomName = message.roomname;
    if (roomName && roomName.length > 0) {
      this.renderRoom(encodeURI(message.roomname));
      this.renderMessage(message);
    }
  }
};

app.renderMessage = function(message) {
  var userName = encodeURI(message.username);
  var text = encodeURI(message.text);
    
  // if (message.username === userName && message.text === text && message.roomname === roomName) {
  var $element = $(`<div class="chat ${message.roomname}"></div>`);
  if (this.friends.hasOwnProperty(userName)) {
    $element = $(`<div class="chat ${message.roomname} friend"></div>`);
  }
  $element.append(`<a class="username" href="#">${encodeURI(message.username).toString().replace(/%20/g, ' ')}</a>`);
  $element.append(`<div>${encodeURI(message.text).toString().replace(/%20/g, ' ')}</div>`);
  $('#chats').append($element);
  // }
};

app.renderRoom = function(roomName) {
  if (!this.chatrooms.hasOwnProperty(roomName)) {
    this.chatrooms[roomName] = true;
    roomName = roomName.split(' ').join('-');
    var $element = $(`<option id="${roomName}">${roomName}</option>`);
    $('#roomSelect').append($element);
  }
};

app.handleUsernameClick = function(username) {
  if (!this.friends.hasOwnProperty(username)) {
    this.friends[username] = true;
    var $element = $(`<option id="${username}">${username}</option>`);
    $('#friendSelect').append($element);
  }
  this.fetch();
};

app.handleSubmit = function() {
  var message = {};
  message.username = this.username;
  message.text = $('#message').val();
  message.roomname = $('#roomSelect').val();
  this.send(JSON.stringify(message));
  $('#message').val(''); 
  this.fetch();
};

app.autoUpdate = function () {
  setTimeout(this.autoUpdate.bind(this), 5000);
  this.fetch();
};

$(document).ready(function() {  
  $(document).on('click', '.username', function(e) {
    app.handleUsernameClick(encodeURI($(this).text()));
    e.preventDefault();
  });
  
  
  $('#roomSelect').change(function() {
    var roomName = $('#roomSelect').val();
    $('.chat').css('display', 'none');
    $(`.chat.${roomName}`).css('display', 'block');
  });

  $('#send .submit').submit(function() {
    app.handleSubmit();
    return false;
  });
  
  app.init();
});