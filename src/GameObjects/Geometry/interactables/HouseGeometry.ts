import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { colorGeometry } from '../../../utility/ThreeUtils';
import { RoadHouseState, getXZPosition } from '../../../state/RoadHouseState';
import { PositionStateType } from '../../../state/PositionState';
import { GameObject } from '../../GameObject';

/**
 * Returns a single town/house mesh at the x,z position scaled relative to hexagon radius r.
 */
function createTownMesh(x: number, z:number, r: number) {
    const scale = 0.8;
    const townWidth = r*0.2*scale;
    const townLength = r*0.3*scale;
    const townBaseHeight = r*0.2*scale;
    const roofHeight = r*0.1*scale;

    // Basic box for town base
    // toNonIndexed() is a workaround to let it merge with the extrude geometry below
    const townBase = new THREE.BoxGeometry(townWidth, townBaseHeight, townLength).toNonIndexed();
    
    // Generate triangular prism roof
    const triangle = new THREE.Shape();
    triangle.moveTo(-townWidth*0.5, 0);
    triangle.lineTo(townWidth*0.5, 0);
    triangle.lineTo(0, roofHeight);
    triangle.lineTo(-townWidth*0.5, 0);

    const extrudeSettings = {
        steps:1, depth: townLength, bevelEnabled: false,
    };
    const prism = new THREE.ExtrudeGeometry(triangle, extrudeSettings);
    prism.translate(0,townBaseHeight*0.5, -0.5*townLength);

    const finalGeom = BufferGeometryUtils.mergeBufferGeometries([townBase, prism]);
    finalGeom.translate(x, townBaseHeight*0.5, z);
    colorGeometry(finalGeom, new THREE.Color(255, 50, 50));
    return new THREE.Mesh(finalGeom, new THREE.MeshStandardMaterial({vertexColors: true}));
}

function createRoadMesh(x:number, z:number, r:number, rotation: number) {
    const roadWidth = r*0.07;
    const roadLength = r*0.6;
    const roadHeight = r*0.07;

    const road = new THREE.BoxGeometry(roadWidth, roadHeight, roadLength);
    road.rotateY(rotation);
    road.translate(x, roadHeight*0.5, z);
    colorGeometry(road, new THREE.Color(255, 50, 50));
    return new THREE.Mesh(road, new THREE.MeshStandardMaterial({vertexColors: true}));

}

export class HouseGeometry extends GameObject {
    houses: THREE.Mesh[];

    state: RoadHouseState;
    outerHexagonRadius: number;

    constructor(state: RoadHouseState, outerHexagonRadius: number) {
        super();
        this.state = state;
        this.outerHexagonRadius = outerHexagonRadius;
        this.houses = [];

        this.updateMeshes();
    }

    public updateMeshes() {
        // lazy delete all meshes and recreate - possiby change in future
        this.houses.forEach((house) => {
            super.remove(house);
        });
        this.houses = [];

        const stateArray = this.state.getArray();
        for (let i = 0; i < stateArray.length; i++) {
            const col = stateArray[i];
            for (let j = 0; j < col.length; j++) {
                const col2 = col[j];
                for (let k = 0; k < col2.length; k++) {
                    const position = getXZPosition(i, j, k, this.outerHexagonRadius);
                    const positionState = stateArray[i][j][k];

                    if (positionState.type === PositionStateType.TOWN) {
                        const mesh = createTownMesh(position.x, position.y, this.outerHexagonRadius);
                        this.houses.push(mesh);
                        super.add(mesh);
                    } else if (positionState.type === PositionStateType.ROAD) {
                        // Depending on which position the road is in, change rotation.
                        let rotation:number;
                        if (k === 0) {
                            rotation = Math.PI / 6;
                        }
                        else if (k === 2) {
                            rotation = Math.PI/2;
                        } else {
                            rotation = -Math.PI / 6;
                        }
                        
                        const mesh = createRoadMesh(position.x, position.y, this.outerHexagonRadius, rotation);
                        this.houses.push(mesh);
                        super.add(mesh);
                    }
                }
            }
        }
    }
}
