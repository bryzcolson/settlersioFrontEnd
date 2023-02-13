import {Hexagon} from "../src/Hexagon";

let hexagon:Hexagon;
let offsetHexagon:Hexagon;
const R = 5;
const HEIGHT = R*Math.sqrt(3);
const X = 100;
const Y = 500;
beforeEach(() => {
    hexagon = new Hexagon(0,0,R);
    offsetHexagon = new Hexagon(X,Y,R);
});

test("Center", () => {
    let dist = hexagon.distanceToHexagon(0,0);
    expect(dist).toBeCloseTo(Math.sqrt(3)*2.5,4);

    dist = offsetHexagon.distanceToHexagon(X,Y);
    expect(dist).toBeCloseTo(Math.sqrt(3)*2.5,4);
});

test("Corners", () => {
    //Left most. Clockwise
    let dist = hexagon.distanceToHexagon(-R,0);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(-R/2,HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(R/2,HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(R,0);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(R/2,-HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(-R/2,-HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);

    dist = offsetHexagon.distanceToHexagon(-R+X,Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(-R/2+X,HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(R/2+X,HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(R+X,0+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(R/2+X,-HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(-R/2+X,-HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
});

test("Corners in by 0.1", () => {
    //Top and bottom corners. Should be HEIGHT/2*0.1
    let dist = hexagon.distanceToHexagon(-0.9*R/2,0.9*HEIGHT/2);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = hexagon.distanceToHexagon(0.9*R/2,0.9*HEIGHT/2);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = hexagon.distanceToHexagon(0.9*R/2,-0.9*HEIGHT/2);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = hexagon.distanceToHexagon(-0.9*R/2,-0.9*HEIGHT/2);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);

    //Left and right corners - easy
    dist = hexagon.distanceToHexagon(-R*0.9,0);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = hexagon.distanceToHexagon(R*0.9,0);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);

    //Top and bottom corners. Should be HEIGHT/2*0.1
    dist = offsetHexagon.distanceToHexagon(-0.9*R/2+X,0.9*HEIGHT/2+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = offsetHexagon.distanceToHexagon(0.9*R/2+X,0.9*HEIGHT/2+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = offsetHexagon.distanceToHexagon(0.9*R/2+X,-0.9*HEIGHT/2+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = offsetHexagon.distanceToHexagon(-0.9*R/2+X,-0.9*HEIGHT/2+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);

    //Left and right corners - easy
    dist = offsetHexagon.distanceToHexagon(-R*0.9+X,0+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
    dist = offsetHexagon.distanceToHexagon(R*0.9+X,0+Y);
    expect(dist).toBeCloseTo(HEIGHT/2*0.1,4);
});

test("Edges", () => {
    // Top left corner. Clockwise after that
    let dist = hexagon.distanceToHexagon(-R/4-R/2, HEIGHT/4);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(0, HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(R/4+R/2, HEIGHT/4);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(R/4+R/2, -HEIGHT/4);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(0, -HEIGHT/2);
    expect(dist).toBeCloseTo(0,4);
    dist = hexagon.distanceToHexagon(-R/4-R/2, -HEIGHT/4);
    expect(dist).toBeCloseTo(0,4);

    dist = offsetHexagon.distanceToHexagon(-R/4-R/2+X, HEIGHT/4+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(0+X, HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(R/4+R/2+X, HEIGHT/4+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(R/4+R/2+X, -HEIGHT/4+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(0+X, -HEIGHT/2+Y);
    expect(dist).toBeCloseTo(0,4);
    dist = offsetHexagon.distanceToHexagon(-R/4-R/2+X, -HEIGHT/4+Y);
    expect(dist).toBeCloseTo(0,4);
});

