import { Camera, PerspectiveCamera } from 'three';
import { GameObject } from '../GameObject';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TerrainGeometry } from '../Geometry/terrain/TerrainGeometry';
export class CameraController extends GameObject {
    camera: PerspectiveCamera;
    orbit: OrbitControls

    constructor(canvas: HTMLCanvasElement,
        tileGridWidth: number, tileGridHeight: number, hexagonWorldRadius: number,
        terrain: TerrainGeometry, initialCameraAspectRatio: number) {
        super();

        this.camera = new PerspectiveCamera();
        this.camera.aspect = initialCameraAspectRatio;
        this.camera.position.set(0, 25, 25);
        super.add(this.camera);

        this.orbit = new OrbitControls(this.camera, canvas);
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