  // YOUR CODE HERE:
$(document).ready(function() {
  app = {};

  app.init = function() {
    this.server = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages';
    this.username = location.search.split('=')[1];
    this.chatRooms = {};
    var app = this;
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
      data: {limit: 500},
      dataType: 'json',
      success: function (data) {
        console.log('chatterbox: Data retrieved');
        console.log(data.results);
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
    for (message of messages) {
      var roomName = message.roomname;
      if (!this.chatRooms.hasOwnProperty(roomName)) {
        this.renderRoom(roomName);
      }
      this.renderMessage(message);
    }
  };

  app.renderMessage = function(message) {
    var chatRoom = message.roomname;
    var $element = $(`<div class = "chat ${chatRoom}"> </div>`);
    $element.append(`<a class = "username">${message.username}<a/>`);
    $element.append(`<div>${JSON.stringify(message.text)}</div>`);
    $('#chats').append($element);
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

  app.init();
});