// YOUR CODE HERE:
app = {};

app.init = function() {
  this.server = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages';
  this.username = location.search.split('=')[1];
  this.chatRooms = {};
  
  //this.fetch();
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
  setTimeout(app.fetch.bind(app), 5000);
  
  $.ajax({
    type: 'GET',
    url: app.server,
    data: {limit: 1000},
    dataType: 'json',
    success: function (data) {
      console.log('chatterbox: Data retrieved');
      // console.log(data.results);
      app.clearMessages();
      app.renderMessages(data.results);
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
  messages = _.sortBy(messages, 'createdAt').reverse();
  for (message of messages) {
    this.renderMessage(message);
  }
};

app.renderMessage = function(message) {
  debugger;
  var userName = encodeURI(message.username);
  var text = encodeURI(message.text);
  var roomName = encodeURI(message.roomname);
  
  // if (message.username === userName && message.text === text && message.roomname === roomName) {
  if (!this.chatRooms.hasOwnProperty(roomName)) {
    this.renderRoom(roomName);
  }  
  
  var $element = $(`<div class="chat ${message.roomname}"></div>`);
  $element.append(`<a class="username">${encodeURI(message.username).replace(/[^a-zA-Z0-9]/g, '')}<a/>`);
  $element.append(`<div>${encodeURI(message.text).replace(/[^a-zA-Z0-9]/g, '')}</div>`);
  
  $('#chats').append($element);
  // }
};

app.renderRoom = function(roomName) {
  this.chatRooms[roomName] = true;
  roomName = roomName.split(' ').join('-');
  var $element = $(`<option id="${roomName}">${roomName}</option>`);
  $('#roomSelect').append($element);
};

app.handleUsernameClick = function() {

};

app.handleSubmit = function() {
  
};

$(document).ready(function() {  
  $('#roomSelect').change(function() {
    var roomName = $('#roomSelect').val();
    $('.chat').css('display', 'none');
    $(`.chat.${roomName}`).css('display', 'block');
  });

  $('#send .submit').click(function() {
    var message = {};
    message.username = app.username;
    message.text = $('#formMessage').val();
    message.roomname = 'lobby';
    app.send(JSON.stringify(message));
   
    $('#formMessage').val('');
  });
  
  app.init();
});