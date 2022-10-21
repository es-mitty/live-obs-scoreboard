var express = require('express');
var socket = require('socket.io');
var box = require('boxen');
var os = require('os');
var clockInt; 

var game = {
    home_name: "",
    away_name: "",
    home_score: 0,
    home_fouls: 0,
    away_score: 0,
    away_fouls: 0,
    away_color: "",
    clock: {
        status: 'stopped',
        h: 0,
        m: 0,
        s: 0,
        ms: 0,
    },
    period: 0,
};

//Print computer ip addresses
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

//App setup
var app = express();
var server = app.listen(80, function(){
    console.log("Listening to requests at: " + addresses);
});

//Static files
app.use(express.static('public'));

//Socket setup
var io = socket(server);

io.on('connection', function(socket){
    console.log('Socket connection made:'+socket.id);
    socket.emit('board', game);
    socket.emit('ip', {address:addresses});

    socket.on('score_dat', function(data){
        console.log(data);
        io.sockets.emit('score_dat', data);
    });

    socket.on('teams',function(data){
        game.home_name =  data.home_name;
        game.away_name = data.away_name;
        game.away_color = data.away_color;

        io.sockets.emit('teams', data);

        console.log(box('Teams updated\n----------------\nHome Team: '+game.home_name
        +'\nAway Team: '+game.away_name
        +'\nAway Color: '+game.away_color, {padding: 1}));

        io.sockets.emit('board',game);

    });

    socket.on('scores', function(data){

        console.log(data);
        
        game = data;

        console.log(game);
        io.sockets.emit('board', game);

    });

    socket.on('clock',function(data){
        game = data;
        clock(data.clock.status);
        
    });

});

//functions

function clock(status){
    if(status == 'running'){
        clearInterval(clockInt);
        clockInt = setInterval(countDown, 100);
    }
    if(status == 'stopped'){
        clearInterval(clockInt);
        console.log("Clock stopped.");
    }
}
function countDown(){
    game.clock.ms--;
    if(game.clock.ms == -1){
        game.clock.s--;
        game.clock.ms = 9;
    }
    if(game.clock.s == -1){
        game.clock.m--;
        game.clock.s = 59;
    }
    if(game.clock.m == -1){
        game.clock.h--;
        game.clock.m = 59;
    }
    if(game.clock.h == 0 && game.clock.m == 0 && game.clock.s == 0 && game.clock.ms == 0){
        clock('stopped');
    }
    
    io.sockets.emit('clock', game);
    console.log(game.clock);
}