package edu.eci.arsw.collabpaint.controlller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.List;

@Controller
public class STOMPMessagesHandler {
    Dictionary<String, List<Point>> puntosPorDibujo = new Hashtable<>();

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception{
        int nums;
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        synchronized(puntosPorDibujo){
            if (puntosPorDibujo.get(numdibujo) != null) {
                puntosPorDibujo.get(numdibujo).add(pt);
                nums = puntosPorDibujo.get(numdibujo).size();
            } else {
                puntosPorDibujo.put(numdibujo,new ArrayList<>());
                puntosPorDibujo.get(numdibujo).add(pt);
                nums = 1;
            }
            if (puntosPorDibujo.get(numdibujo).size() > 3){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo,puntosPorDibujo.get(numdibujo));
                puntosPorDibujo.get(numdibujo).clear();
            }
        }
        System.out.println("Nuevo punto recivido en el servidor! "+pt);
    }
}
