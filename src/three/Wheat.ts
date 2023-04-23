import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { Tile, TileType } from './Tile';


/**
 * Fill the top half of the hexagon with wheat stalks and either the bottom left or bottom right half.
 * @param tile The tile for this hexagon
 * @param geoms list of geometries to append to
 */
function addWheatField(tile: Tile, geoms: THREE.BufferGeometry[], rotation:number):number {
    const centerX = tile.innerHexagon.centerX;
    const centerY = tile.innerHexagon.centerY;
    const r = tile.innerHexagon.radius;

    // Define the separation between wheat stalks
    const separation = 0.04 * r;

    // Define the range of heights and widths for the wheat stalks
    const depth = 0.05*r;
    const height = 0.05*r;

    const numberOfWheatRows = Math.floor(r / (depth + separation)) - 1;
    let bottomSide:number;
    if (Math.random() > 0.5) {
        bottomSide = 1;
    } else {
        bottomSide = -1;
    }

    // Loop through each row and column and add a wheat row
    for (let i = 0; i < numberOfWheatRows; i++) {
        const z = depth*0.5 + 0.5* separation + i*(depth + separation);
        // Width is twice radius of hexagon if in the middle of hexagon but
        // as you go up remove how much the edge of the hexagon encroaches in.
        // This is twice the inverted slope of line going up.
        const width = 2*r - 2 / Math.sqrt(3) * z;

        const boxGeometry = new THREE.BoxGeometry(
            width, height, depth
        );
        boxGeometry.translate(0, 0, z);
        boxGeometry.rotateY(rotation);
        boxGeometry.translate(centerX, 0, centerY);
        geoms.push(boxGeometry);

        // Add a wheat row to the bottom of the hexagon
        const boxGeometry2 =  new THREE.BoxGeometry(
            width*0.75, height, depth
        );
        boxGeometry2.translate(width*0.125*bottomSide, 0, -z);
        boxGeometry2.rotateY(rotation);
        boxGeometry2.translate(centerX, 0, centerY);
        geoms.push(boxGeometry2);
    }
    return bottomSide;
}

function addWindmill(tile:Tile, windmillGeoms: THREE.BufferGeometry[],
        windmillRotationAroundCenterOfTile:number, bottomSideWithWheat:number, turbineGeoms:THREE.Mesh[]) {

    //
    // Constants
    //
    const r = tile.innerHexagon.radius;
    const centerX = tile.innerHexagon.centerX;
    const centerY = tile.innerHexagon.centerY;
    const windmillRadius = r * 0.15;
    const windmillHeight = r*0.35;
    const upperWindmillRadius = windmillRadius*0.8;
    const windmillTopRadius = upperWindmillRadius * 1.1;
    const windmillTopCylinderHeight = r * 0.05;
    const windmillTopConeHeight = r * 0.1;
    const turbineRadius = windmillHeight*0.85;
    const turbineHeight = turbineRadius * 0.05;
    const turbineDepth = turbineRadius * 0.02;
    const turbineAxleDepth = turbineRadius*0.2;
    const sailRadius = turbineRadius * 0.85;
    const sailHeight = turbineHeight * 2;
    const sailDepth = turbineDepth * 0.15;

    // Compute where the windmill goes in the tile
    const windmillLocalRotationVertical = 0; // shhhhh we don't need to worry about this variable
    const windmillXRelativeToTileCenter = -1*r*bottomSideWithWheat*0.7;
    const windmillZRelativeToTileCenter = -r*0.3;
    const turbineZRelativeToTileCenter = windmillZRelativeToTileCenter - windmillRadius;
    
    //
    // Windmill structure
    //
    const windmillBaseGeom = new THREE.CylinderGeometry(upperWindmillRadius, 
        windmillRadius, windmillHeight, 6, 1, false);
    windmillBaseGeom.rotateY(windmillLocalRotationVertical);
    windmillBaseGeom.translate(windmillXRelativeToTileCenter, windmillHeight/2, windmillZRelativeToTileCenter);
    windmillBaseGeom.rotateY(windmillRotationAroundCenterOfTile);
    windmillBaseGeom.translate(centerX, 0, centerY);

    const windmillTopCylinderGeom = new THREE.CylinderGeometry(windmillTopRadius, 
        windmillTopRadius, windmillTopCylinderHeight, 6, 1, false);
    windmillTopCylinderGeom.rotateY(windmillLocalRotationVertical);
    windmillTopCylinderGeom.translate(windmillXRelativeToTileCenter, windmillHeight+windmillTopCylinderHeight/2,
        windmillZRelativeToTileCenter);
    windmillTopCylinderGeom.rotateY(windmillRotationAroundCenterOfTile);
    windmillTopCylinderGeom.translate(centerX, 0, centerY);

    const windmillTopConeGeom = new THREE.CylinderGeometry(0, 
        windmillTopRadius, windmillTopConeHeight, 6, 1, false);
    windmillTopConeGeom.rotateY(windmillLocalRotationVertical);
    windmillTopConeGeom.translate(windmillXRelativeToTileCenter, 
        windmillHeight + windmillTopCylinderHeight + windmillTopConeHeight/2, windmillZRelativeToTileCenter);
    windmillTopConeGeom.rotateY(windmillRotationAroundCenterOfTile);
    windmillTopConeGeom.translate(centerX, 0, centerY);

    //
    // Turbines and sails
    //
    const rightTurbine = new THREE.BoxGeometry(turbineRadius, turbineHeight, turbineDepth);
    const bottomTurbine = new THREE.BoxGeometry(turbineRadius, turbineHeight, turbineDepth);
    const leftTurbine = new THREE.BoxGeometry(turbineRadius, turbineHeight, turbineDepth);
    const upTurbine = new THREE.BoxGeometry(turbineRadius, turbineHeight, turbineDepth);
    const turbineAxis = new THREE.BoxGeometry(turbineHeight, turbineHeight, turbineAxleDepth);
    rightTurbine.translate(turbineRadius*0.5, 0, 0);
    bottomTurbine.rotateZ(Math.PI/2);
    bottomTurbine.translate(0, -0.5 * turbineRadius, 0);
    leftTurbine.translate(turbineRadius*-0.5, 0, 0);
    upTurbine.rotateZ(Math.PI*1.5);
    upTurbine.translate(0, 0.5 * turbineRadius, 0);
    turbineAxis.translate(0, 0, 0.5 * turbineAxleDepth);
    const turbine = BufferGeometryUtils.mergeBufferGeometries([
        rightTurbine, bottomTurbine, leftTurbine, upTurbine, turbineAxis
    ]);


    // Create sails for each turbine
    const rightSail = new THREE.BoxGeometry(sailRadius, sailHeight, sailDepth);
    const bottomSail = new THREE.BoxGeometry(sailRadius, sailHeight, sailDepth);
    const leftSail = new THREE.BoxGeometry(sailRadius, sailHeight, sailDepth);
    const upSail = new THREE.BoxGeometry(sailRadius, sailHeight, sailDepth);
    const outDistance = turbineRadius - sailRadius*0.5 - 0.01; // Distance to go out from center of turbine
    const sideOffset = turbineHeight*0.5 + sailHeight*0.5; // Amount to offset from cross
    rightSail.translate(outDistance, sideOffset, 0);
    bottomSail.rotateZ(Math.PI/2);
    bottomSail.translate(sideOffset, -outDistance, 0);
    leftSail.translate(-outDistance, -sideOffset, 0);
    upSail.rotateZ(Math.PI*1.5);
    upSail.translate(-sideOffset, outDistance, 0);
    const sails = BufferGeometryUtils.mergeBufferGeometries([
        rightSail, bottomSail, leftSail, upSail
    ]);

    //
    // Handle coloring the geometries
    //

    // Windmill structure
    // rgb(99, 92, 71)
    const positionAttributeTrunk = windmillBaseGeom.getAttribute('position');
    const colorArrayTrunk = [];
    for (let i = 0; i < positionAttributeTrunk.count; i++) {
        colorArrayTrunk.push(198);
        colorArrayTrunk.push(184);
        colorArrayTrunk.push(142);
    }
    windmillBaseGeom.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayTrunk), 3, true));

    // rgb(54, 57, 61)
    const positionAttributeTop = windmillTopCylinderGeom.getAttribute('position');
    const colorArrayTop = [];
    for (let i = 0; i < positionAttributeTop.count; i++) {
        colorArrayTop.push(54);
        colorArrayTop.push(57);
        colorArrayTop.push(61);
    }
    windmillTopCylinderGeom.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayTop), 3, true));
    const positionAttributeTopCone = windmillTopConeGeom.getAttribute('position');
    const colorArrayTopCone = [];
    for (let i = 0; i < positionAttributeTopCone.count; i++) {
        colorArrayTopCone.push(54);
        colorArrayTopCone.push(57);
        colorArrayTopCone.push(61);
    }
    windmillTopConeGeom.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayTopCone), 3, true));

    // Turbines and sails
    // rgb(146, 97, 42)
    const positionAttributeTurbine = turbine.getAttribute('position');
    const colorArrayTurbine = [];
    for (let i = 0; i < positionAttributeTurbine.count; i++) {
        colorArrayTurbine.push(146);
        colorArrayTurbine.push(97);
        colorArrayTurbine.push(42);
    }
    turbine.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayTurbine), 3, true));

    const positionAttributeSails = sails.getAttribute('position');
    const colorArraySails = [];
    for (let i = 0; i < positionAttributeSails.count; i++) {
        colorArraySails.push(255);
        colorArraySails.push(255);
        colorArraySails.push(255);
    }
    sails.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArraySails), 3, true));

    //
    // Append the geometries to the lists
    //
    windmillGeoms.push(windmillBaseGeom);
    windmillGeoms.push(windmillTopCylinderGeom);
    windmillGeoms.push(windmillTopConeGeom);

    const turbineMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true
    });
    const turbineAndSails = BufferGeometryUtils.mergeBufferGeometries([turbine, sails]);
    const mesh = new THREE.Mesh(turbineAndSails, turbineMaterial);
    mesh.position.add(new THREE.Vector3(
        windmillXRelativeToTileCenter, windmillHeight, turbineZRelativeToTileCenter));
    // NOTE: leaving this comment for future me. rotating the mesh like this will not work to pivot the object around
    // a point. You must apply it to the position object using applyAxisAngle.
    mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), windmillRotationAroundCenterOfTile);   
    mesh.position.applyAxisAngle(new THREE.Vector3(0,1,0), windmillRotationAroundCenterOfTile);
    mesh.position.add(new THREE.Vector3(centerX, 0, centerY));

    turbineGeoms.push(mesh);
}


class WheatField {
    wheatStalks: THREE.Mesh;

    windmillStructure: THREE.Mesh;

    windmillTurbines: THREE.Mesh[];

    constructor(tiles:Tile[][], scene:THREE.Scene) {
        const wheatFieldGeometries: THREE.BufferGeometry[] = [];
        const windmillBaseGeometries: THREE.BufferGeometry[] = [];
        const turbines: THREE.Mesh[] = [];
        for (let i = 0; i < tiles.length; i++) {
            const col = tiles[i];
            for (let j = 0; j < col.length; j++) {
                if (col[j].tileType === TileType.WHEAT) {
                    // 6 possible rotations in the hexagon
                    const rotation = Math.floor(Math.random()*6) * Math.PI/3;
                    const bottomSideWithWheat = addWheatField(col[j], wheatFieldGeometries, rotation);
                    addWindmill(col[j], windmillBaseGeometries,
                        rotation, bottomSideWithWheat, turbines);
                }
            }
        }


        const wheatGeom = BufferGeometryUtils.mergeBufferGeometries(wheatFieldGeometries);
        const windmillGeom = BufferGeometryUtils.mergeBufferGeometries(windmillBaseGeometries);

        const wheatStalksMaterial = new THREE.MeshLambertMaterial({
            color: 0xffcd49
        });
        const windMillBaseMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true
        });

        this.wheatStalks = new THREE.Mesh(wheatGeom, wheatStalksMaterial);
        this.windmillStructure = new THREE.Mesh(windmillGeom, windMillBaseMaterial);
        this.windmillTurbines = turbines;
        scene.add(this.wheatStalks);
        scene.add(this.windmillStructure);
        for (let i = 0; i < turbines.length; i++) {
            scene.add(turbines[i]);
        }
    }

    public update(deltaTime:number): void {
        // Rotate each turbine
        for (let i = 0; i < this.windmillTurbines.length; i++) {
            const windmill = this.windmillTurbines[i];
            const localForward = new THREE.Vector3(0, 0, 1).applyQuaternion(windmill.quaternion);
            windmill.rotateOnWorldAxis(
                localForward, -deltaTime/1000);
        }
    }

}

export {WheatField};