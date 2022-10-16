var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var topic = 0;

    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var PublicPointAtTopic = function (pt){
        stompClient.send(topic, {}, JSON.stringify(pt));
    }
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(topic, function (eventbody) {
                alert(eventbody);
                var pnt = JSON.parse(eventbody.body);
                addPointToCanvas(pnt);
            });
        });

    };
    
    

    return {

        connect: function () {
            var can = document.getElementById("canvas");
            topic = "/topic/newpoint." + id;
            
            //websocket connection
            connectAndSubscribe();
            if(window.PointerEvent){
                can.addEventListener("pointerdown", function(evt){
                    let pt = getMousePosition(evt);
                    addPointToCanvas(pt);
                    PublicPointAtTopic(pt);
                })
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            PublicPointAtTopic(pt);
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();