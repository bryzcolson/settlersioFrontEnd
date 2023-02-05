import React from 'react';
import {BufferAttribute} from "three";

export class Terrain extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  makeVertices() {
    let arr = [];
    let onePointLen = 0.9;
    let halfPointLen = 0.5*onePointLen;
    let onePointHeight = onePointLen * Math.sqrt(3)*0.5;
    // Loop each point to create the triangle mesh
    for (let n = 0; n < this.props.size[0] * this.props.size[1]; n++) {
      let i = n % this.props.size[0];
      let j = Math.floor(n / this.props.size[1]);

      let x = 0;
      if (j % 2 === 0) {
        x = 0.5*onePointLen + i*onePointLen;
      } else {
        x = i*onePointLen;
      }
      let y = j * onePointHeight;
      let z = 0;
      // Upwards triangle
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

      //Downwards triangle
      v1 = [x,y,z];
      v2 = [x +halfPointLen, y -onePointHeight, z];
      v3 = [x+onePointLen, y, z];
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
    return new BufferAttribute(new Float32Array(arr), 3);
  }

  render() {
    return (
      <mesh {...this.props}>
        <bufferGeometry>
          <bufferAttribute attach={"attributes-position"} {...this.makeVertices()}/>
        </bufferGeometry>
        <meshStandardMaterial wireframe={true}/>
      </mesh>
    );
  }
}