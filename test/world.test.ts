import { Tile } from "../src/tile";
import {World} from "../src/world"

let world:World;
const R = 1;
const H = R*Math.sqrt(3);
beforeEach(() => {
    //world = new World()
});

test("Terrain Size", () => {
    world = new World(1,1,R,R,1);
    let width = world.terrainWidth;
    let height = world.terrainHeight;
    expect(width).toBeCloseTo(2*R,3);
    expect(height).toBeCloseTo(H,3);

    world = new World(2,1, R,R, 1);
    expect(world.terrainWidth).toBeCloseTo(3.5*R, 4);
    expect(world.terrainHeight).toBeCloseTo(1.5*H,4);

    world = new World(1,2, R,R, 1);
    expect(world.terrainWidth).toBeCloseTo(R*2, 4);
    expect(world.terrainHeight).toBeCloseTo(2*H,4);

    world = new World(2,2, R,R, 1);
    expect(world.terrainWidth).toBeCloseTo(3.5*R, 4);
    expect(world.terrainHeight).toBeCloseTo(2.5*H,4);

    world = new World(3,3, R,R, 1);
    expect(world.terrainWidth).toBeCloseTo(5*R, 4);
    expect(world.terrainHeight).toBeCloseTo(3.5*H,4);

    world = new World(4,4, R,R, 1);
    expect(world.terrainWidth).toBeCloseTo(6.5*R, 4);
    expect(world.terrainHeight).toBeCloseTo(4.5*H,4);
});

function testOwnsPoints(x:number, y:number, tile:Tile) {
    expect(tile.doesOwnPoint(-0.9*R+x,0+y)).toBeTruthy();
    expect(tile.doesOwnPoint(0+x,0+y)).toBeTruthy();
    expect(tile.doesOwnPoint(-0.9*R+x,0+y)).toBeTruthy();
    expect(tile.doesOwnPoint(0.9*R+x,0+y)).toBeTruthy();
    expect(tile.doesOwnPoint(0+x,0.9*H/2+y)).toBeTruthy();
    expect(tile.doesOwnPoint(0+x,-0.9*H/2+y)).toBeTruthy();
    
    expect(tile.doesOwnPoint(x+R,y)).toBeFalsy();
}

test("Tiles Valid", () => {
    world = new World(1,1,R,R,1);
    let tile:Tile = world.tiles[0][0];
    let x = tile.outerHexagon.centerX;
    let y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(R,4);
    expect(y).toBeCloseTo(H/2,4);
    testOwnsPoints(x,y,tile);

    // 2x1 world
    world = new World(2,1, R,R,1);
    tile = world.tiles[0][0];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(R,4);
    expect(y).toBeCloseTo(H/2,4);
    testOwnsPoints(x,y,tile);

    tile = world.tiles[1][0];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(2.5*R,4);
    expect(y).toBeCloseTo(H,4);
    testOwnsPoints(x,y,tile);

    //2x2 world
    world = new World(2,2,R,R,1);
    tile = world.tiles[0][0];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(R,4);
    expect(y).toBeCloseTo(H/2,4);
    testOwnsPoints(x,y,tile);

    tile = world.tiles[1][0];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(2.5*R,4);
    expect(y).toBeCloseTo(H,4);
    testOwnsPoints(x,y,tile);

    tile = world.tiles[0][1];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(R,4);
    expect(y).toBeCloseTo(H*1.5,4);
    testOwnsPoints(x,y,tile);

    tile = world.tiles[1][1];
    x = tile.outerHexagon.centerX;
    y = tile.outerHexagon.centerY;
    expect(x).toBeCloseTo(2.5*R,4);
    expect(y).toBeCloseTo(2*H,4);
    testOwnsPoints(x,y,tile);
});




test("asdf", () => {
    let array: number[][] = new Array<Array<number>>(2).fill(new Array<number>(1));
  
    array[0] = [1];
    expect(array[0][0]).toBe(1);
  
    array[1] = [2];
    expect(array[1][0]).toBe(2);
    expect(array[0][0]).toBe(1);
  });