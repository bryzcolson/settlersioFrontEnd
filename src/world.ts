import * as THREE from "three";
import { Tile } from "./tile";

class World {
    tiles:Tile[][];
    terrain:THREE.Mesh;

    tileGridWidth:number;
    tileGridHeight:number;
    vertexDensity:number;
    hexagonRadius:number;
    innerHexagonFraction:number;
    rSQ3:number;
    terrainWidth:number;
    terrainHeight:number;

    /**
     * Creates a new world
     * @param tileGridWidth How many tiles along the x axis we support
     * @param tileGridHeight How many tiles along the y axis we support
     * @param hexagonRadius Distance from center of hexagon to the corner
     * @param innerHexagonFraction How much fractionally smaller should the inner hexagon be? (The hexagon that traps the noise map)
     * @param vertexDensity How many vertices on terrain per unit length
     */
    constructor(tileGridWidth:number, tileGridHeight:number, hexagonRadius:number, innerHexagonFraction:number, vertexDensity:number) {
        this.tileGridWidth = tileGridWidth;
        this.tileGridHeight = tileGridHeight;
        this.hexagonRadius = hexagonRadius;
        this.innerHexagonFraction = innerHexagonFraction;
        this.vertexDensity = vertexDensity;
        
        const rSQ3 = hexagonRadius * Math.sqrt(3);
        this.rSQ3 = rSQ3;
        let _defaultTile = new Tile(0,0,0,0);
        //this.tiles = new Array<Array<Tile>>(this.tileGridWidth).fill(new Array<Tile>(this.tileGridHeight).fill(_defaultTile));
        this.tiles = [];
        for (let i = 0; i < tileGridWidth; i++) {
            this.tiles.push([]);
            for (let j = 0; j < tileGridHeight; j++) {
                this.tiles[i].push(_defaultTile);
            }
        }
        this.initTiles();
        
        // ---------------------- CLIENT SIDE -----------------------------------
        // Make the terrain
        if (tileGridWidth % 2 == 0) {
            this.terrainWidth = 0.5*hexagonRadius*(3*tileGridWidth+1);
        } else {
            this.terrainWidth = Math.ceil(tileGridWidth/2)*2*hexagonRadius + Math.floor(tileGridWidth/2)*hexagonRadius;
        }
        if (tileGridHeight % 2 == 0) {
            this.terrainHeight = rSQ3*(tileGridHeight-0.5);
        } else {
            this.terrainHeight = rSQ3*tileGridHeight;
        }
        let terrainGridWidth = Math.ceil(vertexDensity * this.terrainWidth);
        let terrainGridHeight = Math.ceil(vertexDensity * this.terrainHeight);

        const size = new THREE.Vector3(this.terrainWidth,0,this.terrainHeight);
        let plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size.x, size.z, terrainGridWidth, terrainGridHeight),
            new THREE.MeshStandardMaterial({
                wireframe:true,
                color: 0xFFFFFF,
                side: THREE.FrontSide,
            })
        );
        plane.rotateX(-Math.PI / 2);

        //loop all verticies
        //get tile that owns that vertex
        //get the height from that tile
        let posAttr = plane.geometry.getAttribute("position");
        for (let n = 0; n < posAttr.count; n++) {
            let x = posAttr.getX(n) + this.terrainWidth/2;
            let y = posAttr.getY(n) + this.terrainHeight/2;
            if (n== Math.floor(n/2)){
                console.log("hi");
            }

            // convert to tile grid space
            //let i = x / rSQ3;
            //let j = y / rSQ3 + 0.5;
            // four possible tiles
            //let i1 = Math.floor(i);
            //let i2 = Math.ceil(i);
            //let j1 = Math.floor(j);
            //let j2 = Math.ceil(j);
            let tile:Tile|null = null;
            for (let i = 0; i < tileGridWidth; i++) {
                for (let j = 0; j < tileGridHeight; j++) {
                    if (this.tiles[i][j].doesOwnPoint(x,y)) {
                        console.log("AAAAH");
                        tile = this.tiles[i][j];
                        break;
                    }
                }
                if (tile !== null) {
                    break;
                }
            }


            let height:number;
            if (tile === null) {
                height = 0;
            } else {
                height = tile.getHeight(x,y);
                console.log(height);
                console.log("sup");
            }
            posAttr.setZ(n, height);
        }
    
        this.terrain = plane;
    }

    initTiles() {
        // Fill with random tiles
        for (let i = 0; i < this.tileGridWidth; i++) {
            for (let j = 0; j < this.tileGridHeight; j++) {
                // Convert to x/y world coordinates
                let x = this.hexagonRadius + this.hexagonRadius*i*1.5;
                let y:number;
                if (i % 2 === 0) {
                    y = j*this.rSQ3 + 0.5*this.rSQ3;
                } else {
                    // Odd i value, y value is offset
                    y = j*this.rSQ3 + this.rSQ3;
                }

                this.tiles[i][j] = new Tile(x,y,this.hexagonRadius*this.innerHexagonFraction, this.hexagonRadius);
            }
        }
    }

    getTerrain(): THREE.Mesh {
        return this.terrain;
    }
}

export {World}