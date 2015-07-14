var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//pair of user's name and user's socket
var currentUsers = [];
var currentSockets = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  
  socket.on('private message', function(receiveName, msg){
	//send message to user-self
	socket.emit('private message', msg);
	//send private message to specify user
	currentSockets[currentUsers.indexOf(receiveName)].emit('private message', msg);
  });
  
  socket.on('new user', function(userName){
	//check user's name exist or not
	if(currentUsers.indexOf(userName)==-1){
		currentUsers.push(userName);
		currentSockets.push(socket);
		io.emit('chat message', userName+' Join');
		io.emit('add userList', userName);
	}
	else{
		socket.emit('userName exist', userName);
	}
  });
  
  socket.on('user left', function(name){
	//remove leaved user's name and socket
	currentSockets.splice(currentUsers.indexOf(name),1);
	currentUsers.splice(currentUsers.indexOf(name),1);
	io.emit('user left', name);
  });
  
  //when a new client connected add current users to client selector
  for (var i = 0; i < currentUsers.length; i++) {
    socket.emit('add userList', currentUsers[i]);
  }
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
