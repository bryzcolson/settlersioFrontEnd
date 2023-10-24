import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { BufferGeometry, Vector3 } from 'three';
import { Tile, TileType } from '../../../utility/Tile';
import { Hexagon } from '../../../utility/Hexagon';
import { GameObject } from '../../GameObject';

const TREE_RADIUS_HEXAGON_MULTIPLE = 0.1; // Tree radius multiple compared to hexagon radius
const TREE_HEIGHT_HEXAGON_MULTIPLE = 0.2; // Tree height compared to hexagon radius

function addTreeGeometry(position:Vector3,treeRadius:number, 
        treeSectionHeight:number, geometries:THREE.BufferGeometry[]) {

    const randomMultiplierRange = [0.75, 1.25]; // Modifies the height of the tree between these two multiples
    const radiusModulator = THREE.MathUtils.randFloat(0.8, 1.2);

    // Make the trunk
    const trunkHeight = treeSectionHeight * THREE.MathUtils.randFloat(randomMultiplierRange[0], 
        randomMultiplierRange[1]);
    const trunkRadius = treeRadius*0.3;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8, 1, true);
    trunkGeometry.translate(position.x, position.y + trunkHeight*0.5, position.z);
    // Set color of trunk
    const positionAttributeTrunk = trunkGeometry.getAttribute('position');
    const colorArrayTrunk = [];
    for (let i = 0; i < positionAttributeTrunk.count; i++) {
        colorArrayTrunk.push(98);
        colorArrayTrunk.push(65);
        colorArrayTrunk.push(32);
    }
    trunkGeometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayTrunk), 3, true));


    geometries.push(trunkGeometry);

    const percentOverlap = 0.4; // how much the y value should be modulated. 0 = same height as before.
    const heightModulator = THREE.MathUtils.randFloat(randomMultiplierRange[0],
        randomMultiplierRange[1]);
    // Make the leaves/cones
    let y = trunkHeight + position.y;
    // Either 3 or 4 tall
    const numCones = 3 + Math.round(Math.random());
    for (let i = 0; i < numCones; i++) {
        const r = treeRadius * (1 - i * 0.3) * radiusModulator;
        const h = treeSectionHeight * (1 - i * 0.3) * heightModulator;
        const cone = new THREE.ConeGeometry(r, h, 8);
        cone.translate(position.x, y, position.z);

        // Set colors
        const colorArrayCone = [];
        const positionAttributeCone = cone.getAttribute('position');
        for (let j = 0; j < positionAttributeCone.count; j++) {
            colorArrayCone.push(5);
            colorArrayCone.push(71);
            colorArrayCone.push(42);
        }
        cone.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colorArrayCone), 3, true));

        geometries.push(cone);
        y += h * percentOverlap;
    }
}

function addForest(tile:Tile, geometries:BufferGeometry[]) {
    // Custom hexagon because the inner hexagon isn't small enough to limit our trees
    const customHexagon = new Hexagon(
        tile.innerHexagon.centerX,
        tile.innerHexagon.centerY,
        tile.innerHexagon.radius*0.9
    );

    const leftMost = customHexagon.centerX - customHexagon.radius;
    const rightMost = customHexagon.centerX + customHexagon.radius;
    const downMost = customHexagon.centerY - customHexagon.radius;
    const upMost = customHexagon.centerY + customHexagon.radius;


    // try to generate trees
    for (let i = 0; i < 100; i++) {
        // TODO: Handle intersecting trees or generate more consistently in a grid pattern.
        const x = THREE.MathUtils.randFloat(leftMost, rightMost);
        const z = THREE.MathUtils.randFloat(downMost, upMost); // TODO Refactor this to centerZ
        if (customHexagon.isPointInside(new THREE.Vector2(x,z))) {
            const y = tile.getHeight(new THREE.Vector2(x,z));
            addTreeGeometry(new Vector3(x,y,z),
                tile.outerHexagon.radius * TREE_RADIUS_HEXAGON_MULTIPLE,
                tile.outerHexagon.radius * TREE_HEIGHT_HEXAGON_MULTIPLE,
                geometries);
        }
    }
    
}

export class TreeGeometry extends GameObject {
    treeMesh: THREE.Mesh;

    constructor(tiles: Tile[][]) {
        super();
        const geometries: BufferGeometry[] = [];
        for (let i = 0; i < tiles.length; i++) {
            const col = tiles[i];
            for (let j = 0; j < col.length; j++) {
                if (col[j].tileType === TileType.WOOD) {
                    addForest(col[j], geometries);
                }
            }
        }

        const geom = BufferGeometryUtils.mergeBufferGeometries(geometries);

        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true
        });
        this.treeMesh = new THREE.Mesh(geom, mat);
        super.add(this.treeMesh);
    }
}