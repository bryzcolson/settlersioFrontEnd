import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Terrain } from "./Terrain";

export const ThreeJSCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    camera.position.z = 5;

    const terrain = new Terrain({
      width: 3,
      height: 3,
      radius: 1,
      hexRadius: 1,
    });
    const vertices = terrain.makeVertices();
    scene.add(new THREE.Mesh(terrain.makeVertices()));

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => canvasRef.current.removeChild(renderer.domElement);
  }, []);

  return (
    <canvas ref={canvasRef}/>
  );
};