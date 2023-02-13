import * as THREE from "three";

export class Terrain {
  constructor(props) {
    this.props = props;

    this.tileGridWidth = props.width;
    this.tileGridHeight = props.height;
    this.hexagonWorldRadius = props.radius;
    this.hexagonVertexRadius = props.hexRadius;

    // Get terrain width/height based on hexagons being
    this.terrainWidth = this.hexagonWorldRadius * (0.5 + 1.5 * this.tileGridWidth);
    this.terrainHeight = this.hexagonWorldRadius * (this.tileGridHeight + 1) * 0.5 * Math.sqrt(3); // sqrt(3)/2 because height different than width
  }

  makeVertices() {
    let arr = [];
    let onePointLen = this.hexagonWorldRadius / this.hexagonVertexRadius; // Length of a hexagon vertex segment in worldspace
    let hexagonWorldHeight = Math.sqrt(3) * this.hexagonWorldRadius; // Length of the height of a hexagon in worldspace
    let halfPointLen = 0.5 * onePointLen;
    let onePointHeight = onePointLen * Math.sqrt(3) * 0.5;
    let z = 0; // TODO. Figure this out dynamically depending on which hexagon/tile in (in the loop)
    for (let i = 0; i < this.tileGridWidth; i++) {
      for (let j = 0; j < this.tileGridHeight; j++) {
        // Compute top left corner of hexagon xy value in worldspace
        let baseX = (1.5 * i + 0.5) * this.hexagonWorldRadius;
        let baseY = hexagonWorldHeight * j;
        if (i % 2 === 1) { // Odd i, offset hexagon height downwards
          baseY = baseY + hexagonWorldHeight * 0.5;
        }
        // Loop each vertex in this hexagon and calculate the points in its triangle
        let maxXc = this.hexagonVertexRadius; // number of vertex segments in this row
        for (let yc = 0; yc <= this.hexagonVertexRadius * 2; yc++) {
          for (let xc = 0; xc < maxXc; xc++) { // < not equals so we don't generate triangles outside hexagon
            let x = baseX + xc * onePointLen;
            let y = baseY;
            if (yc === 0) {
              // Top row -> Only calculate down triangles
              this.addDownTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr);
            }
            else if (yc === this.hexagonVertexRadius * 2) {
              // Bottom row -> Only calculate up triangles
              this.addUpTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr);
            } else {
              // middle row -> both up and down triangles
              this.addDownTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr);
              this.addUpTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr);
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
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr),3));
    return geometry;
  }

  addUpTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr) {
    let v1 = [x, y, z];
    let v2 = [x + halfPointLen, y - onePointHeight, z];
    let v3 = [x + onePointLen, y, z];
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

  addDownTriangleToArray(x, y, z, onePointLen, halfPointLen, onePointHeight, arr) {
    let v1 = [x, y, z];
    let v2 = [x + halfPointLen, y + onePointHeight, z];
    let v3 = [x + onePointLen, y,z];
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
}