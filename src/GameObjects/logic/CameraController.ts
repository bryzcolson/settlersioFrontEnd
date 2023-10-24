import { Camera } from 'three';
import { GameObject } from '../GameObject';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TerrainGeometry } from '../Geometry/terrain/TerrainGeometry';
export class CameraController extends GameObject {
    orbit: OrbitControls

    constructor(camera: Camera, canvas: HTMLCanvasElement,
        tileGridWidth: number, tileGridHeight: number, hexagonWorldRadius: number,
        terrain: TerrainGeometry) {
        super();
        this.orbit = new OrbitControls(camera, canvas);
        const cameraTarget = terrain.terrainMesh.position.clone();
        // Temporary approximation for testing
        cameraTarget.x += tileGridWidth*hexagonWorldRadius*0.75;
        cameraTarget.z += tileGridHeight*hexagonWorldRadius;
        this.orbit.target = cameraTarget;
        this.orbit.enableDamping = true;
        this.orbit.autoRotate = false;
        this.orbit.update();
    }


    override update(_deltaTime:number) {
        this.orbit.update();
    }
}