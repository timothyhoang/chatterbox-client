app = {};

/* Initialize application and auto-fetch messages from server */
app.init = function() {
  this.server = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages';
  this.username = location.search.split('=')[1].replace(/%20/, ' ');
  this.chatrooms = {lobby: true};
  this.friends = {all: true};
  this.specialCharactersRegexp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*/;

  $('#lobby-tablink').click();

  this.autoUpdate();
};

/* Send a message in JSON format to the server - check spec for message structure */
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

/* Fetch messages from server and render them on DOM */
app.fetch = function() {
  var app = this;
  
  $.ajax({
    type: 'GET',
    url: app.server,
    data: { limit: 500, order: '-createdAt'},
    dataType: 'json',
    success: function (data) {
      console.log('chatterbox: Data retrieved');
      app.updateFeed.bind(app)(data.results);
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve data', data);
    }
  });
};

/* Deletes messages on the server */
app.delete = function(objectId) {
  var app = this;
  
  $.ajax({
    type: 'DELETE',
    url: `${app.server}/${objectId}`,
    success: function (data) {
      console.log('chatterbox: Data deleted');
      app.fetch();
    },
    error: function (data) {
      console.error('chatterbox: Failed to delete data', data);
    }
  });
};

/* Clear chat messages from the DOM */
app.clearMessages = function() {
  $('#chats').empty();
};

/* Sanitize text to be used in HTML element */
app.sanitizeElement = function(element) {
  return element.replace(this.specialCharactersRegexp, '').split(' ').join('-');
};

/* Sanitize text */
app.sanitizeText = function(text) {
  return text.replace(this.specialCharactersRegexp, '');
};

/* Appends messages to DOM */
app.updateFeed = function(messages) {
  app.clearMessages.bind(app)();

  for (message of messages) {
    if (message.username && message.text && message.roomname) {
      message.username = this.sanitizeElement(message.username).toLowerCase();
      message.text = this.sanitizeText(message.text);
      message.roomname = this.sanitizeElement(message.roomname).toLowerCase();

      if (!this.chatrooms.hasOwnProperty(message.roomname)) {
        this.renderRoom(message.roomname);
      }

      var currentRoom = $('#roomSelect').val();
      var currentFriend = $('#friendSelect').val();
      if ((currentRoom === 'lobby' || currentRoom === message.roomname) && (currentFriend === 'all' || currentFriend === message.username)) {
        this.renderMessage(message);
      }
    }
  }
};

/* Get base chat DOM node */
app.getChatContainer = function() {
  return $(`<div class="chat"></div>`);
};

/* Get add friend class to DOM element if username is on friends list */
app.addFriendClassToChatContainer = function($element, username) {
  if (this.friends.hasOwnProperty(username)) {
    $element.addClass('friend');
  }
};

/* Get chatroom name to chat DOM element */
app.addRoomnameClassToChatContainer = function($element, roomname) {
  $element.addClass(roomname);
};

/* Add username element inside of chat DOM element */
app.addUsernameElementInChatContainer = function($element, username) {
  $element.append(`<a class="username" href="#">${username}</a>`);
};

/* Add a delete button inside of chat DOM element */
app.addDeleteButtonInChatContainer = function($element, objectId) {
  $element.append(`<button class="delete-button" id="${objectId}">x</button>`);
};

/* Add text element inside of chat DOM element */
app.addTextElementInChatContainer = function($element, text) {
  $element.append(`<div>${text}</div>`);
};

/* Parses message, wraps chat message in an element, appends to DOM */
app.renderMessage = function(message) {
  var $message = this.getChatContainer();
  this.addFriendClassToChatContainer($message, message.username);
  this.addRoomnameClassToChatContainer($message, message.roomname);
  this.addUsernameElementInChatContainer($message, message.username);
  this.addDeleteButtonInChatContainer($message, message.objectId);
  this.addTextElementInChatContainer($message, message.text);
  $('#chats').append($message);
};

/* Add a room to the list of chatrooms and render on DOM */
app.renderRoom = function(roomname) {
  if (!this.chatrooms.hasOwnProperty(roomname)) {
    this.chatrooms[roomname] = true;
    
    var $option = $(`<option id="${roomname}">${roomname}</option>`);
    $('#roomSelect').append($option);
    
    var $tab = $(`<button id="${roomname}-tablink" class="tablinks" value="${roomname}">${roomname}</button>`);
    $('#chatroom-tabs').append($tab);
  }
};

/* Adds username clicked to friends list */
app.handleusernameClick = function(username) {
  if (!this.friends.hasOwnProperty(username)) {
    this.friends[username] = true;
    var $element = $(`<option id="${username}">${username}</option>`);
    $('#friendSelect').append($element);
  }
  this.fetch();
};

/* Handles submission of chat messages by user */
app.handleSubmit = function() {
  var message = {};
  message.username = this.username;
  message.text = $('#message').val();
  message.roomname = $('#roomSelect').val();
  this.send(JSON.stringify(message));
  $('#message').val(''); 
  this.fetch();
};

/* Handles selection of chat room tabs */
app.handleSelectingTabs = function(roomname) {
  var roomname = $('.tablinks.active').val();
  $('#roomSelect').val(roomname);
  $('.chat').css('display', 'none');
  $(`.chat.${roomname}`).css('display', 'block');
};

/* Handles selection of chat rooms */
app.handleSelectingRooms = function() {
  var roomname = $('#roomSelect').val();
  $('.chat').css('display', 'none');
  $(`.chat.${roomname}`).css('display', 'block');
};

/* Handles addition of chat rooms */
app.handleAddingRooms = function() {
  var roomname = app.sanitizeElement($('#room').val());
  app.renderRoom(roomname);
  $('#room').val('');
  $('#roomSelect').val(roomname);
};

/* Handles seletion of friends */
app.handleSelectingFriends = function() {
  var username = $('#friendSelect').val();
  $('.chat').css('display', 'none');
  $(`.chat.${username}`).css('display', 'block');
};

/* Handles removal of friends */
app.handleRemovingFriends = function(username) {
  var username = app.sanitizeElement($('#friend').val());
  $('#friend').val('');
  $('#friendSelect').val('all');
  delete this.friends[username];
  $(`#${username}`).remove();
};

/* Auto fetches messages from server at set interval */
app.autoUpdate = function () {
  setTimeout(this.autoUpdate.bind(this), 2000);
  this.fetch();
};

$(document).ready(function() {  
  $(document).on('click', '.username', function(e) {
    app.handleusernameClick($(this).text());
    e.preventDefault();
  });

  $(document).on('click', '.delete-button', function() {
    app.delete($(this).attr('id'));
  });
  
  $(document).on('click', '.tablinks', function() {
    $('.tablinks').removeClass('active');
    $(this).addClass('active');
    app.handleSelectingTabs($(this).val());
  });

  $('#send .submit').submit(function() {
    app.handleSubmit();
    return false;
  });

  $('#roomSelect-add-button').click(function() {
    $('#roomSelect-add-form').toggle('display');
  });

  $('#friendSelect-remove-button').click(function() {
    $('#friendSelect-remove-form').toggle('display');
  });

  $('#roomSelect').change(function() {
    app.handleSelectingRooms();
  });

  $('#roomSelect-add-form .submit').submit(function() {
    app.handleAddingRooms();
    return false;
  });

  $('#friendSelect').change(function() {
    app.handleSelectingFriends();
  });

  $('#friendSelect-remove-form .submit').submit(function() {
    app.handleRemovingFriends();
    return false;
  });
  
  app.init();
});