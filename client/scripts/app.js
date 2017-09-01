// YOUR CODE HERE:
app = {
  server: 'http://parse.sfm6.hackreactor.com/'
};

app.init = function() {

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
  $.ajax({
    type: "GET",
    url: app.server
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessage = function(message) {
  var $element = $(`<div class="chat">${message.text}</div>`);
  $('#chats #${}').append($element);
};

app.renderRoom = function(roomName) {
  var $element = $(`<option id="${roomName}">${roomName}</option>`);
  $('#roomSelect').append($element);
};

app.handleUsernameClick = function() {

};

app.handleSubmit = function() {

};