import React from 'react';
import { Canvas } from '@react-three/fiber';
import {CameraControls} from "@react-three/drei";
import { World } from './components/World.js';
import './App.css';

function App() {
  const cameraControls = React.useRef();

  return (
    <div className='App'>
      <Canvas>
        <CameraControls ref={cameraControls}/>
        <ambientLight color="white" intensity={0.4}/>
        <pointLight color="#ffdca8" intensity={1.2} distance={100} castshadow={true}/>
        <World/>
      </Canvas>
    </div>
  );
}

export default App;
