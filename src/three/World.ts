import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { addContinentalShelf } from './ContinentalShelf';
import { Tile, TileType } from './Tile';

/**
 * Adds a triangle's vertex positions and vertex colors to the given arrays
 * @param triangle the triangle of positions
 * @param vertexArray the array to append the positions to
 * @param colorArray the array to append the colors to
 * @param tile The tile this triangle is in. Used to compute the color
 */
function addTriangle(triangle: THREE.Triangle, vertexArray: number[], colorArray: number[], tile: Tile) {
    vertexArray.push(triangle.a.x);
    vertexArray.push(triangle.a.y);
    vertexArray.push(triangle.a.z);
    vertexArray.push(triangle.b.x);
    vertexArray.push(triangle.b.y);
    vertexArray.push(triangle.b.z);
    vertexArray.push(triangle.c.x);
    vertexArray.push(triangle.c.y);
    vertexArray.push(triangle.c.z);

    const color = tile.getColor();
    colorArray.push(color[0]);
    colorArray.push(color[1]);
    colorArray.push(color[2]);
    colorArray.push(color[0]);
    colorArray.push(color[1]);
    colorArray.push(color[2]);
    colorArray.push(color[0]);
    colorArray.push(color[1]);
    colorArray.push(color[2]);
}

export class World {
    hexagonVertexRadius: number; // How many side lengths from hexagon corner to center on the terrain.

    innerHexagonVertexRadius: number; // How many side lengths from inner hexagon corner to center.

    tileGridWidth: number; // How many hexagons horizontally

    tileGridHeight: number;

    tiles: Tile[][];

    hexagonWorldRadius: number; // Hexagon radius in worldspace

    onePointLen: number; // Length of side of a single triangle in the mesh

    onePointHeight: number; // Height of a single triangle in the mesh

    halfPointLen: number; // Half of onePointLen

    terrain: THREE.Mesh;

    /**
     * Creates a terrain
     * @param hexagonWorldRadius The radius of hexagon from center to corner in worldspace
     * @param hexagonVertexRadius Number of segments between vertices inside the hexagon.
     * Higher results in higher resolution terrain
     *
     * @param innerHexagonVertexRadius Number of segments for the inner hexagon.
     * This is where the terrain shaping will occur
     *
     * @param tileTypes A 2d array of tile types defining the game world
     * where array[i][j] is the ith column and jth row
     */
    constructor(
        hexagonWorldRadius: number,
        hexagonVertexRadius: number,
        innerHexagonVertexRadius: number,
        tileTypes: TileType[][]
    ) {
        this.tileGridWidth = tileTypes.length;
        this.tileGridHeight = tileTypes[0].length;
        this.hexagonWorldRadius = hexagonWorldRadius;
        this.hexagonVertexRadius = hexagonVertexRadius;
        this.innerHexagonVertexRadius = innerHexagonVertexRadius;

        // Length of a hexagon vertex segment in worldspace
        this.onePointLen = this.hexagonWorldRadius / this.hexagonVertexRadius;
        this.halfPointLen = 0.5 * this.onePointLen;
        this.onePointHeight = this.onePointLen * Math.sqrt(3) * 0.5;

        this.tiles = [];
        this.terrain = this.makeTerrain(tileTypes);
    }

    private makeTerrain(tileTypes: TileType[][]): THREE.Mesh {
        const geometry = new THREE.BufferGeometry();
        const vertexArray: number[] = [];
        const colorArray: number[] = [];
        // Length of the height of a hexagon in worldspace
        const hexagonWorldHeight = Math.sqrt(3) * this.hexagonWorldRadius;
        for (let i = 0; i < this.tileGridWidth; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.tileGridHeight; j++) {
                // Compute top left corner of hexagon xy value in worldspace
                const basePos = new THREE.Vector2(
                    this.hexagonWorldRadius * 0.5 + 1.5 * this.hexagonWorldRadius * i,
                    0 + hexagonWorldHeight * j
                );
                if (i % 2 === 1) {
                    // Odd i, offset hexagon height downwards
                    basePos.y += hexagonWorldHeight * 0.5;
                }
                const tileType: TileType = tileTypes[i][j];
                const tile = new Tile(
                    basePos.x + this.hexagonWorldRadius * 0.5,
                    basePos.y + hexagonWorldHeight * 0.5,
                    this.onePointLen * this.innerHexagonVertexRadius,
                    this.hexagonWorldRadius,
                    tileType
                );
                this.tiles[i].push(tile);
                if (tileType !== TileType.WATER) {
                    addContinentalShelf(tileTypes, i, j, vertexArray, colorArray,
                        new Vector2(tile.outerHexagon.centerX, tile.outerHexagon.centerY),
                        this.hexagonWorldRadius);      
                    // Loop each vertex in this hexagon and calculate the points in its triangle
                    let maxXc = this.hexagonVertexRadius; // number of vertex segments in this row
                    for (let yc = 0; yc <= this.hexagonVertexRadius * 2; yc++) {
                        // xc < maxXc not equals so we don't generate triangles outside hexagon
                        for (let xc = 0; xc < maxXc; xc++) {
                            if (yc === 0) {
                                // Top row -> Only calculate down triangles
                                addTriangle(this.getDownTriangle(xc, yc, basePos, tile), vertexArray, colorArray, tile);
                            } else if (yc === this.hexagonVertexRadius * 2) {
                                // Bottom row -> Only calculate up triangles
                                addTriangle(this.getUpTriangle(xc, yc, basePos, tile), vertexArray, colorArray, tile);
                            } else {
                                // Everywhere else -> Up and down triangles
                                addTriangle(this.getUpTriangle(xc, yc, basePos, tile), vertexArray, colorArray, tile);
                                addTriangle(this.getDownTriangle(xc, yc, basePos, tile), vertexArray, colorArray, tile);
                            }
                        }
                        if (yc >= this.hexagonVertexRadius) {
                            // top half of hexagon
                            maxXc--;
                        } else {
                            maxXc++;
                        }
                    }
                }
            }
        }
        const vertices = new Float32Array(vertexArray);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArray), 3, true));

        const plane = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                // wireframe:true,
                vertexColors: true,
                side: THREE.FrontSide,
            })
        );
        return plane;
    }

    /**
     * Gets a triangle going upwards from current point in hexagon
     * @param xc The x count in the hexagon vertex loop
     * @param yc The y count in the hexagon vertex loop
     */
    private getUpTriangle(xc: number, yc: number, basePos: THREE.Vector2, tile: Tile): THREE.Triangle {
        if (yc > this.hexagonVertexRadius) {
            // Bottom half of hexagon
            const v1 = this.getXY(xc, yc, basePos);
            const v2 = this.getXY(xc + 1, yc, basePos);
            const v3 = this.getXY(xc + 1, yc - 1, basePos);
            return new THREE.Triangle(
                new THREE.Vector3(v1.x, tile.getHeight(v1), v1.y),
                new THREE.Vector3(v2.x, tile.getHeight(v2), v2.y),
                new THREE.Vector3(v3.x, tile.getHeight(v3), v3.y)
            );
        }
        // Upper half of hexagon
        const v1 = this.getXY(xc, yc, basePos);
        const v2 = this.getXY(xc + 1, yc, basePos);
        const v3 = this.getXY(xc, yc - 1, basePos);
        return new THREE.Triangle(
            new THREE.Vector3(v1.x, tile.getHeight(v1), v1.y),
            new THREE.Vector3(v2.x, tile.getHeight(v2), v2.y),
            new THREE.Vector3(v3.x, tile.getHeight(v3), v3.y)
        );
    }

    private getDownTriangle(xc: number, yc: number, basePos: THREE.Vector2, tile: Tile): THREE.Triangle {
        if (yc >= this.hexagonVertexRadius) {
            // Bottom half of hexagon
            const v1 = this.getXY(xc, yc, basePos);
            const v2 = this.getXY(xc, yc + 1, basePos);
            const v3 = this.getXY(xc + 1, yc, basePos);
            return new THREE.Triangle(
                new THREE.Vector3(v1.x, tile.getHeight(v1), v1.y),
                new THREE.Vector3(v2.x, tile.getHeight(v2), v2.y),
                new THREE.Vector3(v3.x, tile.getHeight(v3), v3.y)
            );
        }
        // Upper half of hexagon
        const v1 = this.getXY(xc, yc, basePos);
        const v2 = this.getXY(xc + 1, yc + 1, basePos);
        const v3 = this.getXY(xc + 1, yc, basePos);
        return new THREE.Triangle(
            new THREE.Vector3(v1.x, tile.getHeight(v1), v1.y),
            new THREE.Vector3(v2.x, tile.getHeight(v2), v2.y),
            new THREE.Vector3(v3.x, tile.getHeight(v3), v3.y)
        );
    }

    /**
     * Gets the world position for a vertex in a hexagon given the x count and y count
     * @param xc x count in loop
     * @param yc y count in loop
     * @param basePos the top left vertex of the hexagon in world coordinates
     * @returns a vector with the x/y coordinates for the vertex at cx,cy
     */
    private getXY(xc: number, yc: number, basePos: THREE.Vector2): THREE.Vector2 {
        const y = basePos.y + yc * this.onePointHeight;
        let leftMostXInRow: number;
        if (yc <= this.hexagonVertexRadius) {
            // top half of hexagon
            leftMostXInRow = basePos.x - this.halfPointLen * yc;
        } else {
            // bottom half of hexagon
            leftMostXInRow = basePos.x - (2 * this.hexagonVertexRadius - yc) * this.halfPointLen;
        }
        const x = leftMostXInRow + this.onePointLen * xc;
        return new THREE.Vector2(x, y);
    }

    getTerrain(): THREE.Mesh {
        return this.terrain;
    }
}
