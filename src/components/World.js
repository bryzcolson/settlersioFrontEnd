import React from 'react';
import { Terrain } from './Terrain.js';

export class World extends React.Component{
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <mesh {...this.props}>
        <planeGeometry args={[10, 10, 10, 10]}/>
        <meshStandardMaterial wireframe={true} color='0xFFFFFF'/>
        <Terrain width={3} height={3} radius={1} hexRadius={1}/>
      </mesh>
    );
  }
}