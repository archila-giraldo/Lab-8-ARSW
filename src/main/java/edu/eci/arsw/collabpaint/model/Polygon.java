package edu.eci.arsw.collabpaint.model;

import java.util.List;

public class Polygon {
    List<Point> points;

    public Polygon(){
    }

    public Polygon(List<Point> points){
        this.points = points;
    }

    public List<Point> getPoints() {
        return points;
    }

    public void setPoints(List<Point> points) {
        this.points = points;
    }

    @Override
    public String toString(){
        StringBuilder pointsS = new StringBuilder();
        for (Point point:points){
            pointsS.append(point.toString());
        }
        return pointsS.toString();
    }
}
