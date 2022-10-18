var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    let topic = "";

    let connected = false;

    var setTopic = function (topicToConnect) {
        topic = topicToConnect;
    };

    let stompClient = null;

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
        setConnected(true);
        alert(topic);
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

    function clickOnCanvas(evt){
        let pt = getMousePosition(evt);
        addPointToCanvas(pt);
        PublicPointAtTopic(pt);
    }


    function setConnected(status) {
        connected = status;

    }

    return {

        connect: function (socket) {
            var can = document.getElementById("canvas");
            can.width = can.width;
            var tempTopic = "/topic/newpoint." + socket;
            setTopic(tempTopic);
            //websocket connection
            if(connected){
                this.disconnect();
            }
            connectAndSubscribe();
            if(window.PointerEvent){
                can.addEventListener("pointerdown", clickOnCanvas);
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
                let can = document.getElementById("canvas");
                can.removeEventListener("pointerdown",clickOnCanvas);
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();