var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//pair of user's name and user's socket
var currentUsers = [];
var currentSockets = [];
var typingUsers = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
	//send message to all client without self
    socket.broadcast.emit('chat message', msg);
  });
  
  socket.on('private message', function(receiveName, msg){
	//send private message to specify user
	currentSockets[currentUsers.indexOf(receiveName)].emit('private message', msg);
  });
  
  socket.on('new user', function(userName){
	//check user's name exist or not
	if(currentUsers.indexOf(userName)==-1){
		currentUsers.push(userName);
		currentSockets.push(socket);
		io.emit('user join', userName);
		io.emit('add userList', userName);
	}
	else{
		socket.emit('userName exist', userName);
	}
  });
  
  socket.on('start typing', function(name){
	if(typingUsers.indexOf(name)==-1){
		typingUsers.push(name);
	}
	io.emit('typing message', typingUsers);
  });
  
  socket.on('stop typing', function(name){
	if(typingUsers.indexOf(name)!=-1){
		typingUsers.splice(typingUsers.indexOf(name),1);
	}
	io.emit('typing message', typingUsers);
  });  
  
  socket.on('disconnect', function(){
	io.emit('user left', currentUsers[currentSockets.indexOf(socket)]);
	//remove leaved user's name and socket
	currentSockets.splice(currentSockets.indexOf(socket),1);
	currentUsers.splice(currentSockets.indexOf(socket),1);
  });
  
  //when a new client connected add current users to client selector
  for (var i = 0; i < currentUsers.length; i++) {
    socket.emit('add userList', currentUsers[i]);
  }
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
