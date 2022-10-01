document.addEventListener("keydown", sendMessage);

var socket;
$(document).ready(function(){
    
    socket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
    socket.on('connect', function() {
        socket.emit('joined', {});
    });
    
    socket.on('status', function(data) {     
        let tag  = document.createElement("p");
        let text = document.createTextNode(data.msg);
        let element = document.getElementById("chat");
        tag.appendChild(text);
        tag.style.cssText = data.style;
        element.appendChild(tag);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);

    });    

    socket.on("received-message", function(data) {
        let messageTag = document.createElement("p");
        let val = document.createTextNode(data.msg["message"]);
        let ele = document.getElementById("chat");
        messageTag.appendChild(val);
        messageTag.style.cssText = data.style;
        ele.appendChild(messageTag);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);

    });  

    socket.on('leave-chat', function(data) {     
        let tag  = document.createElement("p");
        let text = document.createTextNode(data.msg);
        let element = document.getElementById("chat");
        tag.appendChild(text);
        tag.style.cssText = data.style;
        element.appendChild(tag);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);


    }); 
});

function sendMessage(event) {
    if (event.keyCode === 13) {
        let message = document.getElementById("user-message").value;
        if (message !== null) {
            socket.emit("send_message", {"message":message});
            document.getElementById("user-message").value = "";
        }
    }
}    

function leave_chat() {
    console.log("leaving chat");
    // socket.leave("main");
    socket.emit("leave_chat", {"msg":"user left"});
}


function leave_room() {
    console.log("leavee room")
    socket.emit("left", {}, function() {
        socket.disconnect();
        window.location.href = "/home"
    });
}