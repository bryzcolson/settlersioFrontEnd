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
    terrainGridWidth:number;
    terrainGridHeight:number;

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
        if (tileGridWidth == 1) {
            this.terrainHeight = rSQ3*tileGridHeight;
        } else {
            this.terrainHeight = rSQ3*(tileGridHeight+0.5);
        }
        
        this.terrainGridWidth = Math.ceil(vertexDensity * this.terrainWidth);
        this.terrainGridHeight = Math.ceil(vertexDensity * this.terrainHeight);

        let colorTexture = this.getColorTexture();

        const size = new THREE.Vector3(this.terrainWidth,0,this.terrainHeight);
        let plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size.x, size.z, this.terrainGridWidth, this.terrainGridHeight),
            new THREE.MeshStandardMaterial({
                //wireframe:true,
                //color: 0xFFFFFF,
                side: THREE.FrontSide,
                map: colorTexture
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
            let tile = this.findTileThatOwns(x,y);

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

    getColorTexture(): THREE.DataTexture {
        const w = this.terrainGridWidth+1;
        const h = this.terrainGridHeight +1;
        const size = w*h;
        const data = new Uint8Array( 4 * size );
        const color = new THREE.Color( 0xffffff );

        for ( let n = 0;n < size; n ++ ) {
            let i = n % w;
            let j = Math.floor(n / h);
            let x = (i/w)*this.terrainWidth;
            let y = (j/h)*this.terrainHeight;
            let tile = this.findTileThatOwns(x,y);
            let tileColor:number[];
            if (tile == null) {
                tileColor = [0,0,0];
            } else {
                tileColor = tile.getColor(x,y);
            }

            const r = Math.floor( color.r * tileColor[0]);
            const g = Math.floor( color.g * tileColor[1]);
            const b = Math.floor( color.b * tileColor[2]);

            const stride = n * 4;

            data[ stride ] = r;
            data[ stride + 1 ] = g;
            data[ stride + 2 ] = b;
            data[ stride + 3 ] = 255;

        }

        // used the buffer to create a DataTexture

        const texture = new THREE.DataTexture( data, w,h  );
        texture.needsUpdate = true;

        return texture;
    }

    findTileThatOwns(x:number,y:number):Tile|null {
        let tile:Tile|null = null;
        for (let i = 0; i < this.tileGridWidth; i++) {
            for (let j = 0; j < this.tileGridHeight; j++) {
                if (this.tiles[i][j].doesOwnPoint(x,y)) {
                    tile = this.tiles[i][j];
                    break;
                }
            }
            if (tile !== null) {
                break;
            }
        }
        return tile;
    }
}

export {World}