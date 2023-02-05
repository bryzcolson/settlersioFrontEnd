import * as THREE from "three";



class RWorld {
    hexagonVertexRadius: number; // How many side lengths of terrain a hexagon is worth (vertices -1).
    innerHexagonVertexRadius: number; // How many side lengths from inner hexagon edge to center. (vertices -1)

    terrainWidth: number; // Worldspace size of terrain
    terrainHeight: number;
    terrainVertexWidth: number; // How many side lengths of terrain in the entire terrain (vertices - 1). 
    terrainVertexHeight: number;

    tileGridWidth: number; // How many hexagons horizontally
    tileGridHeight: number;

    hexagonWorldRadius:number;


    terrain: THREE.Mesh;


    constructor(tileGridWidth:number, tileGridHeight:number, hexagonWorldRadius: number) {
        this.tileGridWidth = tileGridWidth;
        this.tileGridHeight = tileGridHeight;
        this.hexagonWorldRadius = hexagonWorldRadius;

        this.hexagonVertexRadius = 4;
        this.innerHexagonVertexRadius = 2;

        // Get terrain vertex width/height
        // TODO: THIS WILL NOT WORK FOR 1xN or Nx1 WORLDS
        this.terrainVertexWidth = this.hexagonVertexRadius * (0.5 + 1.5*this.tileGridWidth);
        this.terrainVertexHeight = this.hexagonVertexRadius * (this.tileGridHeight+1);

        // Get terrain width/height based on hexagons being 
        this.terrainWidth = this.hexagonWorldRadius * (0.5 + 1.5*this.tileGridWidth);
        this.terrainHeight = this.hexagonWorldRadius * (this.tileGridHeight+1) * 0.5*Math.sqrt(3); // sqrt(3)/2 because height different than width

        this.terrain = this.makeTerrain();
    }

    makeTerrain(): THREE.Mesh {
        let points: Vertex[] = new Array<Vertex>(this.terrainVertexWidth*this.terrainVertexHeight);
        const geometry = new THREE.BufferGeometry();
        let arr:number[] = [];
        let onePointLen = this.hexagonWorldRadius / this.hexagonVertexRadius; // Length of a hexagon vertex segment in worldspace
        let hexagonWorldHeight = Math.sqrt(3)*this.hexagonWorldRadius; // Length of the height of a hexagon in worldspace
        let halfPointLen = 0.5*onePointLen;
        let onePointHeight = onePointLen * Math.sqrt(3)*0.5;
        let z = 0; // TODO. Figure this out dynamically depending on which hexagon/tile in (in the loop)
        for (let i = 0; i < this.tileGridWidth; i++) {
            for (let j = 0; j < this.tileGridHeight; j++) {
                // Compute top left corner of hexagon xy value in worldspace
                let baseX = this.hexagonWorldRadius*0.5 + 1.5*this.hexagonWorldRadius*i;
                let baseY = 0 + hexagonWorldHeight*j;
                if (i % 2 == 1) { // Odd i, offset hexagon height downwards
                    baseY = baseY + hexagonWorldHeight*0.5;
                }
                // Loop each vertex in this hexagon and calculate the points in its triangle
                let maxXc = this.hexagonVertexRadius; // number of vertex segments in this row
                for (let yc = 0; yc <= this.hexagonVertexRadius*2; yc++) {
                    for (let xc = 0; xc < maxXc; xc++) { // < not equals so we don't generate triangles outside hexagon
                        let x = baseX + xc*onePointLen;
                        let y = baseY;
                        if (yc == 0) {
                            // Top row -> Only calculate down triangles
                            this.addDownTriangleToArray(x,y,z, onePointLen,halfPointLen,onePointHeight, arr);
                        }
                        else if (yc == this.hexagonVertexRadius*2) {
                            // Bottom row -> Only calculate up triangles
                            this.addUpTriangleToArray(x,y,z, onePointLen,halfPointLen,onePointHeight, arr);
                        } else {
                            // middle row -> both up and down triangles
                            this.addDownTriangleToArray(x,y,z, onePointLen,halfPointLen,onePointHeight, arr);
                            this.addUpTriangleToArray(x,y,z, onePointLen,halfPointLen,onePointHeight, arr);
                        }

                    }
                    // Adjust base x/y coordinates to next row
                    baseY = baseY + onePointHeight;
                    if (yc >= this.hexagonVertexRadius) { // bottom half of hexagon
                        maxXc--;
                        baseX = baseX + halfPointLen;
                    } else {
                        maxXc++;
                        baseX = baseX - halfPointLen;
                    }
                }
            }
        }
        const verices = new Float32Array(arr);
        geometry.setAttribute('position', new THREE.BufferAttribute(verices,3));


        //const size = new THREE.Vector3(this.terrainWidth,0,this.terrainHeight);
        let plane = new THREE.Mesh(
            //new THREE.PlaneGeometry(size.x, size.z, this.terrainVertexWidth, this.terrainVertexHeight),
            geometry,
            new THREE.MeshStandardMaterial({
                wireframe:true,
                //color: 0xFFFFFF,
                side: THREE.FrontSide,
                //map: colorTexture
            })
        );
        plane.rotateX(-Math.PI / 2);
        return plane;
    }

    addUpTriangleToArray(x:number,y:number,z:number, 
        onePointLen:number, halfPointLen:number, onePointHeight:number, arr:number[]) {

        let v1 = [x,y,z];
        let v2 = [x+halfPointLen, y-onePointHeight, z];
        let v3 = [x+onePointLen, y,z];
        arr.push(v1[0]);
        arr.push(v1[1]);
        arr.push(v1[2]);
        arr.push(v2[0]);
        arr.push(v2[1]);
        arr.push(v2[2]);
        arr.push(v3[0]);
        arr.push(v3[1]);
        arr.push(v3[2]);
    }
    addDownTriangleToArray(x:number,y:number,z:number, 
        onePointLen:number, halfPointLen:number, onePointHeight:number, arr:number[]) {

        let v1 = [x,y,z];
        let v2 = [x+halfPointLen, y+onePointHeight, z];
        let v3 = [x+onePointLen, y,z];
        arr.push(v1[0]);
        arr.push(v1[1]);
        arr.push(v1[2]);
        arr.push(v2[0]);
        arr.push(v2[1]);
        arr.push(v2[2]);
        arr.push(v3[0]);
        arr.push(v3[1]);
        arr.push(v3[2]);
    }

    getOffsetGrid(): THREE.Texture {
        const w = this.terrainVertexWidth + 1;
        const h = this.terrainVertexHeight + 1;
        const size = w*h;
        const data = new Uint8Array( 3 * size );

        for ( let n = 0;n < size; n ++ ) {
            let i = n % w;
            let j = Math.floor(n / h);

            const stride = n * 4;

            if (j % 2 == 0) {
                data[stride] = 0;
            }
            else {
                data[stride] = -1;
            }
            data[ stride ] = 0;
            data[ stride + 1 ] = 0;
            data[ stride + 2 ] = 0;
        }

        // used the buffer to create a DataTexture

        const texture = new THREE.DataTexture( data, w,h  );
        texture.needsUpdate = true;
        return texture;
    }

    getTerrain(): THREE.Mesh {
        return this.terrain;
    }
}

class Vertex {

}

export {RWorld}