import * as THREE from 'three';
import { Tile, TileType } from './Tile';

export class RWorld {
    hexagonVertexRadius: number; // How many side lengths of terrain a hexagon is worth (vertices -1).

    innerHexagonVertexRadius: number; // How many side lengths from inner hexagon edge to center. (vertices -1)

    tileGridWidth: number; // How many hexagons horizontally

    tileGridHeight: number;

    tiles: Tile[][];

    hexagonWorldRadius: number;

    onePointLen: number;

    onePointHeight: number;

    halfPointLen: number;

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
        // let z = 0;
        // TODO. Figure this out dynamically depending on which hexagon/tile in (in the loop)
        for (let i = 0; i < this.tileGridWidth; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.tileGridHeight; j++) {
                // Compute top left corner of hexagon xy value in worldspace
                const baseX = this.hexagonWorldRadius * 0.5 + 1.5 * this.hexagonWorldRadius * i;
                let baseY = 0 + hexagonWorldHeight * j;
                if (i % 2 === 1) {
                    // Odd i, offset hexagon height downwards
                    baseY += hexagonWorldHeight * 0.5;
                }
                const tileType: TileType = tileTypes[i][j];
                this.tiles[i].push(
                    new Tile(
                        baseX + this.hexagonWorldRadius * 0.5,
                        baseY + hexagonWorldHeight * 0.5,
                        this.onePointLen * this.innerHexagonVertexRadius,
                        this.hexagonWorldRadius,
                        tileType
                    )
                );
                // Loop each vertex in this hexagon and calculate the points in its triangle
                let maxXc = this.hexagonVertexRadius; // number of vertex segments in this row
                for (let yc = 0; yc <= this.hexagonVertexRadius * 2; yc++) {
                    for (let xc = 0; xc < maxXc; xc++) {
                        // < not equals so we don't generate triangles outside hexagon
                        // let x = baseX + xc*this.onePointLen;
                        // let y = baseY;
                        if (yc === 0) {
                            // Top row -> Only calculate down triangles
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc],
                                [xc + 1, yc + 1],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                        } else if (yc === this.hexagonVertexRadius * 2) {
                            // Bottom row -> Only calculate up triangles
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc - 1],
                                [xc + 1, yc],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                        } else if (yc > this.hexagonVertexRadius) {
                            // Bottom half of hexagon - up and down triangles
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc - 1],
                                [xc + 1, yc],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc],
                                [xc, yc + 1],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                        } else if (yc < this.hexagonVertexRadius) {
                            // Top half of hexagon - up and down triangles
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc, yc - 1],
                                [xc + 1, yc],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc],
                                [xc + 1, yc + 1],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                        } else {
                            // yc == this.hexagonVertexRadius (middle row)
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc, yc - 1],
                                [xc + 1, yc],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                            this.addTriangle(
                                [baseX, baseY],
                                [xc, yc],
                                [xc + 1, yc],
                                [xc, yc + 1],
                                vertexArray,
                                colorArray,
                                this.tiles[i][j]
                            );
                        }
                    }
                    // baseY = baseY + onePointHeight;
                    if (yc >= this.hexagonVertexRadius) {
                        // bottom half of hexagon
                        maxXc--;
                        // baseX = baseX + halfPointLen;
                    } else {
                        maxXc++;
                        // baseX = baseX - halfPointLen;
                    }
                }
            }
        }
        const verices = new Float32Array(vertexArray);
        geometry.setAttribute('position', new THREE.BufferAttribute(verices, 3));
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
        plane.rotateX(-Math.PI / 2);
        return plane;
    }

    /**
     * Adds 3 points to an array
     * @param base the base x y pair
     * @param c1 the cx cy pair for first point (countx county)
     * @param c2 cx/cy pair for second point
     * @param c3 ...
     * @param arr The array to add to
     */
    private addTriangle(
        base: number[],
        c1: number[],
        c2: number[],
        c3: number[],
        vertexArray: number[],
        colorArray: number[],
        tile: Tile
    ) {
        const v1 = this.getXY(c1[0], c1[1], base[0], base[1]);
        const color1 = tile.getColor();
        v1.push(tile.getHeight(v1[0], v1[1]));
        const v2 = this.getXY(c2[0], c2[1], base[0], base[1]);
        const color2 = tile.getColor();
        v2.push(tile.getHeight(v2[0], v2[1]));
        const v3 = this.getXY(c3[0], c3[1], base[0], base[1]);
        const color3 = tile.getColor();
        v3.push(tile.getHeight(v3[0], v3[1]));

        vertexArray.push(v1[0]);
        vertexArray.push(v1[1]);
        vertexArray.push(v1[2]);
        vertexArray.push(v2[0]);
        vertexArray.push(v2[1]);
        vertexArray.push(v2[2]);
        vertexArray.push(v3[0]);
        vertexArray.push(v3[1]);
        vertexArray.push(v3[2]);

        colorArray.push(color1[0]);
        colorArray.push(color1[1]);
        colorArray.push(color1[2]);
        colorArray.push(color2[0]);
        colorArray.push(color2[1]);
        colorArray.push(color2[2]);
        colorArray.push(color3[0]);
        colorArray.push(color3[1]);
        colorArray.push(color3[2]);
    }

    private getXY(xc: number, yc: number, baseX: number, baseY: number): number[] {
        // vertex 1
        const y = baseY + yc * this.onePointHeight;
        let leftMostXInRow: number;
        if (yc <= this.hexagonVertexRadius) {
            // top half of hexagon
            leftMostXInRow = baseX - this.halfPointLen * yc;
        } else {
            // bottom half of hexagon
            leftMostXInRow = baseX - (2 * this.hexagonVertexRadius - yc) * this.halfPointLen;
        }
        const x = leftMostXInRow + this.onePointLen * xc;
        return [x, y];
    }

    getTerrain(): THREE.Mesh {
        return this.terrain;
    }
}
