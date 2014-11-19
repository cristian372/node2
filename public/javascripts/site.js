$(function($) {
	// vemos el evento de teclado sobre el campo de texto nickname y verificamos si el usuario a presionado ENTER
	//y que no este vacio
	var socket=io();
	$("#nickname").keydown(function(event){
		if(event.keyCode==13 && $(this).val()!="")
		{
			console.log(socket);
			socket.emit("setnickname",{"nick":$(this).val()});
		}
	});
	socket.on("setnickname", function(response){
        if(response.server===true)
        {
            loadhtml("/saladechat/");
            $("#nickname").attr('disabled', 'true');

        }else{
            alert(response.server)
        }
    });
    var loadhtml=function(url)
    {
    	$.ajax({
    		url: url,
    		type: 'GET',
    		dataType: 'html',
    		data: {},
    	})
    	.done(function(html){
    		$("#content").html(html);
    		enabledchat();
            lista();
    	})
    	.fail(function(){

    	})
    	.always(function(){

    	});
    }
    var enabledchat=function()
    {
        $("#menvio").keydown(function(event) {
            if(event.keyCode==13)
            {
                socket.emit("mensajes",{"nick":$("#nickname").val(),"msm":$(this).val()})
                //alert($("#nick").val());
                $(this).val("");
    		}
    	});
    }

    socket.on("mensajes", function(response){
        console.log(response);
        $("#mensajes").append("<li>"+response.nick+">"+response.msm+"</li>")
    });
    var lista=function(){
        socket.emit("lista", {}); 
    }
    socket.on("lista", function (lista) {
        html="";
        for(var i=0;i<lista.length;i++)
        {
            html+="<li>"+lista[i].nick+"</li>";
        }
        $("#lista").html(html);
    });
    var desconectado=function(){
        socket.emit("desconectado", {});
    }
    socket.on("desconectado", function (dato) {
        $("#desconectado"+ dato.nick).remove();
    });
});