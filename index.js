var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var currentUsers = new Array();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  
  socket.on('new user', function(userName){
	if(currentUsers.indexOf(userName)==-1){
		currentUsers.push(userName);
		io.emit('chat message', userName+' Join');
	}
	else{
		socket.emit('userName exist', userName);
	}
  });
  
  socket.on('user left', function(name){
	currentUsers.splice(currentUsers.indexOf(name),1);
	io.emit('chat message', name + ' Left');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
