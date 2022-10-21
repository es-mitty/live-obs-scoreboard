//Make connection
var socket = io.connect(document.location.href);

var game = {};

var clockInt;

//JQuery
$(document).ready(function(){

    $('#update-teams').click(function(){
        updateTeams();
    });

    $('.counter').find("a:contains('+')").click(function(event){
        add_val = parseInt($(event.target).text().slice(1,2));
        console.log(add_val);
        counter_val_item = $(event.target).parent().next();
        counter_val_item.val(parseInt(counter_val_item.val()) + add_val);
        updateScore();
    });

    $('.counter').find("a:contains('-')").click(function(event){
        sub_val = parseInt($(event.target).text().slice(1,2));
        console.log(sub_val);
        counter_val_item = $(event.target).parent().prev();
        counter_val_item.val(parseInt(counter_val_item.val()) - sub_val);
        updateScore();
    });

});

//functions
function updateTeams(){
    input_home = document.getElementById('home-name').value;
    input_away = document.getElementById('away-name').value;
    away_color = document.getElementById('away-color').value;

    socket.emit('teams', {
        home_name: input_home,
        away_name: input_away,
        away_color: away_color
    });

}

function updateScore(){

        game.home_score = document.getElementById('home-score').value;
        game.home_fouls = document.getElementById('home-fouls').value;

        game.away_score = document.getElementById('away-score').value;
        game.away_fouls = document.getElementById('away-fouls').value;

        game.period = document.getElementById('period').value;

    socket.emit('scores', game);

}

function calcClockText(h, m, s, ms){

    h = h == 0 ? "" : h+":";

    m = m == 0 ? "" : h == 0 ? m >= 10 ? m : m+":" :"0"+m+":";

    s = m == 0 ? s : s >= 10 ? s : "0" + s;

    ms = m == 0 && h == 0 ? "."+ms : "";

    ms = ms.slice(0,2);

    return ""+h+m+s+ms+"";
}

function clockStart(){
    game.clock.status = 'running';
    socket.emit('clock', game);
}
function clockStop(){
    game.clock.status = 'stopped';
    socket.emit('clock', game);
}
function setClock(h,m,s,ms){
    game.clock.h = h;
    game.clock.m = m;
    game.clock.s = s;
    game.clock.ms = ms;

    document.getElementById('clock').innerHTML = calcClockText(game.clock.h,game.clock.m,game.clock.s,game.clock.ms);

    updateScore();

}

//Socket events
socket.on('teams',function(data){
    game.home_name = data.home_name;
    game.away_name = data.away_name;
    game.away_color = data.away_color;
    
    $('#disp-home-name').text('Home - '+game.home_name);
    $('#disp-away-name').html('Away - <span style=" color: white; background-color:'+game.away_color+'";">'+game.away_name+'</span>');

    console.log("Home:"+game.home_name
    +" | Away:"+game.away_name
    +" | Away Color:"+game.away_color);

    $('#notifications').prepend('<div class="alert alert-success alert-dismissible">'
    +'<a class="close" data-dismiss="alert" aria-label="close">&times;</a>'
    +'Teams successfully updated.</div>');
});

socket.on('board', function(data){
    game = data;
    document.getElementById('clock').innerHTML = calcClockText(game.clock.h,game.clock.m,game.clock.s,game.clock.ms);
    document.getElementById('disp-home-name').innerHTML = "Home - "+game.home_name;
    document.getElementById('disp-away-name').innerHTML = 'Away - <span style=" color: white; background-color:'+game.away_color+'";">'+game.away_name+'</span>';
    document.getElementById('home-name').value = game.home_name;
    document.getElementById('away-name').value = game.away_name;
    document.getElementById('home-score').value = game.home_score;
    document.getElementById('away-score').value = game.away_score;
    document.getElementById('home-fouls').value = game.home_fouls;
    document.getElementById('away-fouls').value = game.away_fouls;
    document.getElementById('period').value = game.period;
    document.getElementById('away-color').value = game.away_color;

    if(game.clock.status = 'running'){

    }else{

    }

});

socket.on('ip',function(data){
    document.getElementById('append-ip').innerHTML = "Live Scoreboard | " + data.address;
});

socket.on('clock', function(data){
    game = data;
    document.getElementById('clock').innerHTML = calcClockText(game.clock.h,game.clock.m,game.clock.s,game.clock.ms);
    
});