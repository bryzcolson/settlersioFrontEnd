import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { BufferGeometry, Vector3, Vector2 } from 'three';
import { Tile, TileType } from '../../../utility/Tile';
import { Hexagon } from '../../../utility/Hexagon';
import { GameObject } from '../../GameObject';

const ZIG_BLOCK_HEIGHT_PROP = 0.1; // Minimum width of top ziggurat block
const SPACE_TOL_PROP = 0.01; // Minimum distance from ziggurat center to other object
const MAX_GEOMETRIC_SAMPLE = 5;
const GEOMETRIC_PROBABILITY = 0.6;

function getBlockHeight(hexRadius:number) {
    return hexRadius*ZIG_BLOCK_HEIGHT_PROP;
}

function getSpaceTol(hexRadius:number) {
    return hexRadius*SPACE_TOL_PROP;
}

// A single block will be ZIG_BLOCK_HEIGHT tall and must have a larger width
function numLevelsZig(zigWidth:number,blockHeight:number) {
    const num_levels = Math.floor(0.5*((zigWidth/blockHeight)-1)); // How many blocks we can put in
    const block_width = zigWidth/(2*num_levels+1); // Actual width of blocks
    return {block_width,num_levels};
}

function addZigGeometry(position:Vector2,zigMid:Vector2,blockHeight:number,geometries:THREE.BufferGeometry[]) {
    const zigWidth = 2*zigMid.length();
    let {block_width,num_levels} = numLevelsZig(zigWidth,blockHeight);
    for(let level = 1; level <= num_levels; level++) {
        const width_l = block_width*(2*(num_levels-level) + 1);
        const z_min = (level-1)*blockHeight;
        const blockLGeom = new THREE.BoxGeometry(width_l,blockHeight,width_l);
        blockLGeom.rotateY(zigMid.angle())
        blockLGeom.translate(position.x,z_min,position.y);
        geometries.push(blockLGeom);
    }
}

// Generate a sample from truncated geometric distribution
function generateGeometricSample() {
    let samp = 1;
    // while(THREE.MathUtils.randFloat(0.,1.) < GEOMETRIC_PROBABILITY && samp < MAX_GEOMETRIC_SAMPLE) {
    //     samp += 1;
    // }
    return samp;
}

/**
 * 
 * @param pt Point to check
 * @param center Center of the square
 * @param radiusVec Vector to midpoint of RHS, angle in (0,pi/2)
 * @returns Distance to square (negative if inside)
 */
function distanceToSquare(pt:Vector2,center:Vector2,radiusVec:Vector2) {
    const phi = radiusVec.angle();
    const R = radiusVec.length();
    let centeredPt = pt.rotateAround(center, phi);
    let {x,y} = centeredPt;
    let z = Math.max(Math.abs(x),Math.abs(y));
    return z-R;
}

function generateZiggurat(hexRadius:number, centers:Array<Vector2>, radiusVecs:Array<Vector2>, numSquares:number) {
    let it = 0;
    const MAX_IT = 10;
    const spaceTol = getSpaceTol(hexRadius);
    while(++it < MAX_IT) {
        // Generate prospective point in hexagon in polar coordinates
        const phi = THREE.MathUtils.randFloat(0.,2*Math.PI);
        const alpha = THREE.MathUtils.euclideanModulo(phi,Math.PI/3);
        const R = Math.cos(alpha)/hexRadius;
        const r = THREE.MathUtils.randFloat((R-spaceTol)/5,R-spaceTol);
        // Convert point to euclidean
        let pt = new Vector2(r*Math.cos(phi), r*Math.sin(phi));
        let validPoint = true;
        let minDist = hexRadius;
        for(let j = 0; j < numSquares && validPoint; j++) {
            const dist_j = distanceToSquare(pt, centers[j], radiusVecs[j]);
            minDist = Math.min(minDist, dist_j);
            if(dist_j < spaceTol) {
                validPoint = false;
            }
        }
        if(validPoint) {
            centers[numSquares] = pt;
            const newRad = THREE.MathUtils.randFloat(0.,minDist/Math.SQRT2);
            const newAngle = THREE.MathUtils.randFloat(0.,Math.PI/2);
            radiusVecs[numSquares] = new Vector2(newRad*Math.cos(newAngle), newRad*Math.sin(newAngle));
            return true;
        }
    }
    return false;
}

function generateZiggurats(tile:Tile, geometries:BufferGeometry[]) {
    const numZigs = generateGeometricSample();
    let centers = new Array<Vector2>(numZigs);
    let radiusVecs = new Array<Vector2>(numZigs);
    let hexRadius = tile.innerHexagon.radius;
    let hexCenter = new Vector2(tile.innerHexagon.centerX, tile.innerHexagon.centerY)
    for(let i = 0; i < numZigs; i++) {
        let createdPt = generateZiggurat(hexRadius, centers, radiusVecs, i);
        if(!createdPt) {
            console.log("DID NOT CREATE POINT")
        } //TODO: THROW ERROR OR SOMETHING
        else {
            addZigGeometry(centers[i].add(hexCenter), radiusVecs[i], getBlockHeight(hexRadius), geometries);
        }
    }
}

export class ZigguratGeometry extends GameObject{
    pyramidMesh: THREE.Mesh;

    constructor(tiles:Tile[][]) {
        super();
        const geometries: BufferGeometry[] = [];
        for (let i = 0; i < tiles.length; i++) {
            const col = tiles[i];
            for (let j = 0; j < col.length; j++) {
                if (col[j].tileType === TileType.BRICK) {
                    generateZiggurats(col[j], geometries);
                }
            }
        }
        const geom = BufferGeometryUtils.mergeBufferGeometries(geometries);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffff55
        });
        this.pyramidMesh = new THREE.Mesh(geom, mat);
        super.add(this.pyramidMesh);
    }
}