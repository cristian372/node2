var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var io=require("socket.io");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
var PORT=3001;
var server=app.listen(PORT,function(){
    console.log("Servidor corriendo en "+PORT);
})
//instanciamos los sockets junto con el servidor


var nicknames=[];
var sockets=io(server);
var salas=[];
sockets.on("connection",function(socket){
    socket.on("setnickname",function(clientedata){
        if(verificarCuenta(clientedata.nick)){    
            nicknames.push(clientedata);
            socket.sala="general"
            socket.join("general");
            socket.nickname=clientedata.nick;
            socket.emit("setnickname",{"server":true});
            return;
        }
        socket.emit("setnickname", {"server":"El nick no esta disponible"});
        return;
    });
    socket.on("mensajes",function(clientedata){ 
        if(clientedata.nick===socket.nickname)
        {   
            var comando=clientedata.msm.split(" ");
            if (comando[0]=="join")
            {
                var sala=comando[1];
                sockets.to(socket.sala).emit("mensajes",{"nick":"SERVIDOR","msm":"El usuario "+socket.nickname+" ahora esta en la sala "+sala});
                socket.leave(socket.sala);
                socket.sala=sala;
                socket.join(sala);
                if(buscarsala(sala)){
                    salas.push({"sala":sala,"usuarios":socket.nickname});
                    return;
                }
                else{
                    salas.push({"usuarios":socket.nickname});
                    sockets.sockets.emit("mensajes",{"nick":salas.sala,"msm":salas.nickname});
                }
                return;
            }
            sockets.to(socket.sala).emit("mensajes",clientedata);
            return;
        } else{ 
            sockets.sockets.emit("mensajes",false);
        } 
    });
    socket.on("lista", function () {
      sockets.sockets.emit("lista",nicknames);
    });
    socket.on("desconectado", function() {
      nicknames.splice(nicknames.indexOf(socket.nick), 1);
      io.emit('remove user', socket.nick);
      console.log("deconectado");
    });
});

var verificarCuenta=function(ins)
{
    for(var i=0;i<nicknames.length;i++)
    {
        if(nicknames[i].nick==ins)
        {
            return false;
        }
    }
    return true;
}
var buscarsala=function(ins){
    for(var i=0;i<salas.length;i++)
    {
        if(salas[i].sala==ins)
        {
            return false;
        }
    }    
    return true;
}
