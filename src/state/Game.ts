import { PerspectiveCamera, Scene } from 'three';
import * as THREE from 'three';
import { GameWorld } from '../three/GameWorld';
import { HighlightedHousePlacementGeometry } from '../GameObjects/Geometry/interactables/HighlightedHousePlacementGeometry';
import { HouseGeometry } from '../GameObjects/Geometry/interactables/HouseGeometry';
import { OceanWater, OceanFloor } from '../GameObjects/Geometry/terrain/Ocean';
import { TerrainGeometry } from '../GameObjects/Geometry/terrain/TerrainGeometry';
import { TreeGeometry } from '../GameObjects/Geometry/terrain/TreeGeometry';
import { WheatField } from '../GameObjects/Geometry/terrain/Wheat';
import { ZigguratGeometry } from '../GameObjects/Geometry/terrain/ZigguratGeometry';
import { CameraController } from '../GameObjects/logic/CameraController';
import { Lighting } from '../GameObjects/misc/Lighting';
import { RoadHouseState, getXZPosition } from './RoadHouseState';
import { GameState } from './GameState';
import { PositionStateType } from './PositionState';
import { HouseUI } from '../UI/HouseUI';

export class Game {
    world: GameWorld;
    camera: PerspectiveCamera;
    terrain: TerrainGeometry;
    lighting : Lighting;
    houseGeometry: HouseGeometry;
    trees: TreeGeometry;
    pyramids: ZigguratGeometry;
    oceanWater: OceanWater;
    oceanFloor: OceanFloor;
    wheatField: WheatField;
    roadHouseState: RoadHouseState;
    highlightedHousePlacementGeometry: HighlightedHousePlacementGeometry;
    cameraControls: CameraController;

    houseUI: HouseUI;

    constructor(scene: Scene, initialCameraAspectRatio: number, canvas: HTMLCanvasElement,
        initialGameState: GameState) {
        this.world = new GameWorld(scene);

        this.camera = new PerspectiveCamera(50, initialCameraAspectRatio, 0.1, 1000);
        this.camera.position.set(0, 25, 25);
        scene.add(this.camera);

        const tileState = initialGameState.tileState
        const tileTypes = tileState.tileTypes;
        const hexagonWorldRadius = 3;
        this.terrain = new TerrainGeometry(hexagonWorldRadius, 6, 5, tileTypes);
        this.world.addGameObject(this.terrain);

        this.cameraControls = new CameraController(this.camera, canvas, tileState.tileGridWidth,
            tileState.tileGridHeight, hexagonWorldRadius, this.terrain);
        this.world.addGameObject(this.cameraControls);
        
        this.trees = new TreeGeometry(this.terrain.tiles);
        this.world.addGameObject(this.trees);

        this.lighting = new Lighting();
        this.world.addGameObject(this.lighting);

        this.pyramids = new ZigguratGeometry(this.terrain.tiles);
        this.world.addGameObject(this.pyramids);

        this.oceanWater = new OceanWater(-hexagonWorldRadius*0.1);
        this.oceanFloor = new OceanFloor(-hexagonWorldRadius*0.5);
        this.world.addGameObject(this.oceanWater);
        this.world.addGameObject(this.oceanFloor);

        this.wheatField = new WheatField(this.terrain.tiles);
        this.world.addGameObject(this.wheatField);

        this.roadHouseState = initialGameState.roadHouseState;
        this.houseGeometry = new HouseGeometry(this.roadHouseState, hexagonWorldRadius);
        this.world.addGameObject(this.houseGeometry);

        this.highlightedHousePlacementGeometry = new HighlightedHousePlacementGeometry(this.terrain, this);
        this.world.addGameObject(this.highlightedHousePlacementGeometry);

        // Things that are not game objects
        this.houseUI = new HouseUI(this);
    }

    adjustCameraAspectRatio(aspectRatio: number) {
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
    }


    update(deltaTime: number, timestamp:number) {
        this.world.update(deltaTime, timestamp);
    }

    addHighlightedAreas(placementGoal: PositionStateType, detached: boolean) {
        const indexLocations = this.roadHouseState.getPossiblePlacementLocations(placementGoal, detached);
        const locations: [THREE.Vector3, THREE.Vector2][] = [];
        indexLocations.forEach((ijkVector: THREE.Vector3) => {
            const worldPositionVector = getXZPosition(ijkVector.x, ijkVector.y, ijkVector.z, 
                this.terrain.hexagonWorldRadius);
            locations.push([ijkVector, worldPositionVector]);
        });
        this.highlightedHousePlacementGeometry.updateLocations(locations, placementGoal);
    }

    getRaycaster(mouseEvent: MouseEvent) : THREE.Raycaster {
        const x = (mouseEvent.clientX / window.innerWidth) * 2 - 1;
        const y = -(mouseEvent.clientY / window.innerHeight) * 2 + 1;
        const mousePos = new THREE.Vector2(x,y);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mousePos, this.camera);
        return raycaster;
    }

    placeRoadOrSettlement(indexLocation: THREE.Vector3, placementGoal: PositionStateType) {
        //TODO: Notify server -> server will notify client
        this.roadHouseState.putState(indexLocation, placementGoal);
        this.houseGeometry.updateMeshes();
        this.highlightedHousePlacementGeometry.empty();
    }
}
