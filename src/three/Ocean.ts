import * as THREE from 'three';

const WIDTH = 1000;
const HEIGHT = 1000;

function makeWaterMesh(y:number) {
    // First, create the water plane geometry
    const waterGeometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 10, 10);

    // Next, create the water material with a reflective surface
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.6,
        reflectivity: 0.6
    });

    // Create the water mesh with the geometry and material
    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);

    // Set the rotation of the water mesh to face up
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = y;

    return waterMesh;
}

function makeOceanFloorMesh(y:number) {
    const oceanFloor = new THREE.PlaneGeometry(WIDTH, HEIGHT, 10, 10);

    const mat = new THREE.MeshStandardMaterial({
        color: 0xeed4ad
    });

    const mesh = new THREE.Mesh(oceanFloor, mat);
    mesh.rotation.x = -Math.PI /2;
    mesh.position.y = y;

    return mesh;
}

export {makeWaterMesh, makeOceanFloorMesh};