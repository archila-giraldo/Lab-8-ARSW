var app = (function () {

    /**
     * Objeto punto con cordenadas x & y
     */
    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    //No vimos necesario el uso del objeto polygon en javascript dado que no se utiliza en ningún momento, solo usamos una lista de puntos, y es redudnante crear una clase nueva para esto

    /**
     * Número del canvas que se está usando
     * @type {string}
     */
    let numDrawing = "";

    /**
     * Estado de la conexión y de suscripciones a un cliente STOMP
     * @type {boolean}
     */
    let connected = false;

    /**
     * Cliente stomp
     * @param drawing
     */
    let stompClient = null;


    let setDrawing = function (drawing) {
        numDrawing = drawing;
    };

    function setConnected(status) {
        connected = status;

    }

    /**
     * Añade un punto al canvas
     * @param point
     */
    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    /**
     * Añade un poligono al canvas
     * @param points lista de puntos que componen el poligono
     */
    let addPolygonToCanvas = function (points){
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        let randomColor = Math.floor(Math.random()*16777215).toString(16);
        ctx.fillStyle = "#"+randomColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for(let i = 1;i < points.length;i++){
            x = points[i].x;
            y = points[i].y;
            ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fill();

    }

    /**
     * Publica un punto en un topico
     * @param pt
     * @constructor
     */
    var PublicPointAtTopic = function (pt){
        stompClient.send("/topic/newpoint."+numDrawing, {}, JSON.stringify(pt));
    }
    /**
     * Publica un punto a una app
     * @param pt
     * @constructor
     */
    var PublicPointAtApp = function (pt){
        stompClient.send("/app/newpoint."+numDrawing, {}, JSON.stringify(pt));
    }

    /**
     * Evento de click sobre un canvas
     * @param evt evento de click
     * @returns {{x: number, y: number}} punto correspondiente al click
     */
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    /**
     * Conecta con un topico dependiendo del número del dibujo
     */
    var connectAndSubscribe = function () {
        setConnected(true);
        alert("/topic/newpoint."+numDrawing);
        console.info('Connecting to WS...');
        let socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe("/topic/newpoint."+numDrawing, function (eventbody) {
                let pnt = JSON.parse(eventbody.body);
                addPointToCanvas(pnt);
            });
            stompClient.subscribe("/topic/newpolygon."+numDrawing,function (eventbody){
                let pnts = JSON.parse(eventbody.body);
                addPolygonToCanvas(pnts);
            });
        });

    };

    /**
     * Agrega un punto y lo publica en una posición determinada por el evento
     * @param evt Evento de click sobre un canvas
     */
    function clickOnCanvas(evt){
        let pt = getMousePosition(evt);
        addPointToCanvas(pt);
        PublicPointAtApp(pt);
    }


    return {

        /**
         * Función que conecta con un dibujo determinado
         * @param drawing numero del dibujo con el que vamos a conectar
         */
        connect: function (drawing) {
            var can = document.getElementById("canvas");
            can.width = can.width;
            setDrawing(drawing);
            //websocket connection
            if(connected){
                this.disconnect();
            }
            connectAndSubscribe();
            if(window.PointerEvent){
                can.addEventListener("pointerdown", clickOnCanvas);
            }
        },

        /**
         * Publica un punto en un topico y lo pinta
         * @param px
         * @param py
         */
        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            PublicPointAtTopic(pt);
            //publicar el evento
        },

        /**
         * Desconectar del STOMP client
         */
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