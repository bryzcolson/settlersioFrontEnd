import { Vector2, Vector3 } from 'three';
import { TileType } from './Tile';

/**
 * Adds a trapezoid where v1 is the position of the top left corner and continues clockwise
 * 
 *   v1 ___ v2
 *     /___\
 *   v4     v3
 */
function addTrapezoid(v1:Vector3, v2:Vector3, v3:Vector3, v4:Vector3,
        vertexArray:number[], colorArray:number[]) {

    vertexArray.push(v1.x, v1.y, v1.z);
    vertexArray.push(v4.x, v4.y, v4.z);
    vertexArray.push(v2.x, v2.y, v2.z);

    vertexArray.push(v2.x, v2.y, v2.z);
    vertexArray.push(v4.x, v4.y, v4.z);
    vertexArray.push(v3.x, v3.y, v3.z);

    for (let i = 0; i < 6; i++) {
        // 238, 212, 173
        colorArray.push(238);
        colorArray.push(212);
        colorArray.push(173);
    }
}

function isWaterOrOutOfBounds(index:{i:number, j:number}, tileTypes:TileType[][]): boolean {
    const maxI = tileTypes.length;
    const maxJ = tileTypes[0].length;

    // Check out of bounds
    if (index.i < 0 ||
        index.i >= maxI ||
        index.j < 0 ||
        index.j > maxJ) {

        return true;
    }

    // Check water
    const tileType = tileTypes[index.i][index.j];
    if (tileType === undefined) return true;
    if (tileType === TileType.WATER) return true;

    return false;
}

/**
 * Generate a trapezoidal continental shelf off the edge of a tile into the ocean floor.
 * @param tileTypes 
 * @param i 
 * @param j 
 * @param vertexArray 
 * @param colorArray 
 * @param centerPos Center position of the hexagon
 */
function addContinentalShelf(tileTypes:TileType[][], i:number, j:number,
        vertexArray:number[], colorArray:number[], centerPos:Vector2, hexagonRadius:number) {

    // Setup some ease of use variables relating to hexagon world size for generating the trapezoid shelf
    const R = hexagonRadius;
    const R_O2 = R*0.5;
    const R_O2_S3 = R_O2 * Math.sqrt(3);
    const SHELF_HEIGHT = R*0.5;
    const SHELF_OUT_DIST = R*0.2;
    const SHELF_O2 = SHELF_OUT_DIST * 0.5;
    const SHELF_O2_S3 = SHELF_O2 * Math.sqrt(3);
    const x = centerPos.x;
    const z = centerPos.y;

    // Only add shelf if a land tile
    if (tileTypes[i][j] !== TileType.WATER) {
        // Even i index hexagon
        const upLeft = {i: i - 1, j: j -1};
        const up = {i, j: j - 1};
        const upRight = {i: i + 1, j: j - 1};
        const bottomLeft = {i: i - 1, j};
        const bottom = {i, j: j + 1};
        const bottomRight = {i: i + 1, j};
        
        // Odd index hexagon - adjacent hexagon indices are different
        if (i % 2 === 1) {
            upLeft.j = j;
            upRight.j = j;
            bottomLeft.j = j + 1;
            bottomRight.j = j + 1;
        }

        if (isWaterOrOutOfBounds(upLeft, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x - R_O2,
                    0,
                    z - R_O2_S3
                ),
                new Vector3(
                    x - R,
                    0,
                    z
                ),
                new Vector3(
                    x - R - SHELF_OUT_DIST,
                    -SHELF_HEIGHT,
                    z,
                ),
                new Vector3(
                    x - R_O2 - SHELF_O2,
                    -SHELF_HEIGHT,
                    z - R_O2_S3 - SHELF_O2_S3, 
                ),
                vertexArray,
                colorArray
            );
        }
        if (isWaterOrOutOfBounds(up, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x + R_O2,
                    0,
                    z - R_O2_S3
                ),
                new Vector3(
                    x - R_O2,
                    0,
                    z - R_O2_S3
                ),
                new Vector3(
                    x - R_O2 - SHELF_O2,
                    -SHELF_HEIGHT,
                    z - R_O2_S3 - SHELF_O2_S3,
                ),
                new Vector3(
                    x + R_O2 + SHELF_O2,
                    -SHELF_HEIGHT,
                    z - R_O2_S3 - SHELF_O2_S3, 
                ),
                vertexArray,
                colorArray
            );
        }
        if (isWaterOrOutOfBounds(upRight, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x + R,
                    0,
                    z
                ),
                new Vector3(
                    x + R_O2,
                    0,
                    z - R_O2_S3,
                ),
                new Vector3(
                    x + R_O2 + SHELF_O2,
                    -SHELF_HEIGHT,
                    z - R_O2_S3 - SHELF_O2_S3,
                ),
                new Vector3(
                    x + R + SHELF_OUT_DIST,
                    -SHELF_HEIGHT,
                    z, 
                ),
                vertexArray,
                colorArray
            );
        }
        if (isWaterOrOutOfBounds(bottomLeft, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x - R,
                    0,
                    z,
                ),
                new Vector3(
                    x - R_O2,
                    0,
                    z + R_O2_S3,
                ),
                new Vector3(
                    x - R_O2 - SHELF_O2,
                    -SHELF_HEIGHT,
                    z + R_O2_S3 + SHELF_O2_S3,
                ),
                new Vector3(
                    x - R - SHELF_OUT_DIST,
                    -SHELF_HEIGHT,
                    z, 
                ),
                vertexArray,
                colorArray
            );
        }
        if (isWaterOrOutOfBounds(bottom, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x - R_O2,
                    0,
                    z + R_O2_S3
                ),
                new Vector3(
                    x + R_O2,
                    0,
                    z + R_O2_S3
                ),
                new Vector3(
                    x + R_O2 + SHELF_O2,
                    -SHELF_HEIGHT,
                    z + R_O2_S3 + SHELF_O2_S3,
                ),
                new Vector3(
                    x - R_O2 - SHELF_O2,
                    -SHELF_HEIGHT,
                    z + R_O2_S3 + SHELF_O2_S3, 
                ),
                vertexArray,
                colorArray
            );
        }
        if (isWaterOrOutOfBounds(bottomRight, tileTypes)) {
            addTrapezoid(
                new Vector3(
                    x + R_O2,
                    0,
                    z + R_O2_S3
                ),
                new Vector3(
                    x + R,
                    0,
                    z
                ),
                new Vector3(
                    x + R + SHELF_OUT_DIST,
                    -SHELF_HEIGHT,
                    z,
                ),
                new Vector3(
                    x + R_O2 + SHELF_O2,
                    -SHELF_HEIGHT,
                    z + R_O2_S3 + SHELF_O2_S3, 
                ),
                vertexArray,
                colorArray
            );
        }
    }
}

export {addContinentalShelf};