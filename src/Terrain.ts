import * as THREE from "three";
import {Noise} from "./Noise";
function createTerrain(noise:Noise, width:number, height:number, densityPerW:number):THREE.Mesh {
    /**const groundGeo = new PlaneGeometry(0, 0, 1000, 1000);

    let disMap = new TextureLoader()
        .setPath("/images/heightmaps/")
        .load("height1.png");

        // No fucking clue what this does
        disMap.wrapS = disMap.wrapT = RepeatWrapping;
        disMap.repeat.set(0,0); // ???? wtf is this

    const groundMat = new MeshStandardMaterial ({
        color: 0x000000,
        wireframe: true,
        displacementMap: disMap,
        displacementScale: 1
    })
    
    let groundMesh = new Mesh(groundGeo, groundMat);
    scene.add(groundMesh);
    groundMesh.position.y = -0.5;**/
    
    const size = new THREE.Vector3(width,0,height);
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, size.z, densityPerW, densityPerW),
        new THREE.MeshStandardMaterial({
            wireframe:true,
            color: 0xFFFFFF,
            side: THREE.FrontSide,
            //vertexColors: true,
        })
    );
    plane.rotateX(-Math.PI / 2)
    plane.castShadow = false;
    plane.receiveShadow = true;

    let posAttr = plane.geometry.getAttribute("position");
    console.log("Count: " + posAttr.count);
    //plane.material.vertexColors = true;
    //let colorAttr = plane.geometry.getAttribute("color");
    //for (let i = 0 ; i < colorAttr.count; i++) {
        //colorAttr.setXYZ(i, 0.5,0.5,0.5);
    //}
    for (let i = 0; i < posAttr.count; i++) {
        //if (heightmap[i] == undefined) {
        //    console.log("BAD TIMES");
        //    console.log(i);
        //}
        //posAttr.setZ(i, heightmap[i]);
        //posAttr.setZ(i, i/10);
        //let distance = hexagon.distanceToHexagon(posAttr.getX(i), posAttr.getY(i));
        let height = noise.getPerlin(posAttr.getX(i), posAttr.getY(i));
        posAttr.setZ(i, height);
        //plane.geometry.getAttribute("color").setXYZ(i, 100,100,100);
        //plane.geometry.getAttribute("color").setXYZ(i, 250*(i/posAttr.count), 250*(i/posAttr.count), 250*(i/posAttr.count));
    }


    //let colorAttr = plane.material.vertexColors = true;



    return plane;
}

export {createTerrain};