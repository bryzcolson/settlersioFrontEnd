import {Hexagon} from "../src/hexagonDistance";

let hexagon:Hexagon;
beforeEach(() => {
    hexagon = new Hexagon(0,0,5);
});

test("Center", () => {
    let dist = hexagon.distanceToHexagon(0,0);
    expect(dist).toBeCloseTo(Math.sqrt(3)*2.5,4);
});
