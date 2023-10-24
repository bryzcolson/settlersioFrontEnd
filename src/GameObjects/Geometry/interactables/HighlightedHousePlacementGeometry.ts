import * as THREE from "three";
import { TerrainGeometry } from "../terrain/TerrainGeometry";
import { colorGeometry } from "../../../utility/ThreeUtils";
import { PositionStateType } from "../../../state/PositionState";
import { GameObject } from "../../GameObject";
import { Game } from "../../../state/Game";

/**
 * Cylindrical region that represents an area that it is possible to place a house/road
 */
class HighlightRegion extends THREE.Mesh {
    indexLocation: THREE.Vector3;
    phongMaterial: THREE.MeshPhongMaterial;

    constructor(cylinder: THREE.CylinderGeometry, mat: THREE.MeshPhongMaterial, indexLocation: THREE.Vector3) {
        super(cylinder, mat);
        this.indexLocation = indexLocation;
        this.phongMaterial = mat;
    }
}

/**
 * Game object that stores all the highlighted regions where towns/cities/roads can be placed.
 * Also handles mouse events on those objects.
 */
export class HighlightedHousePlacementGeometry extends GameObject {
    highlightRadius: number;
    highlightHeight: number;

    regions: HighlightRegion[];
    hoveredMesh: HighlightRegion | undefined;
    
    placementGoal: PositionStateType;

    baseHighlightColor = 0xffff00;
    hoverHighlightColor = 0x00ff00;

    game: Game;


    constructor(terrain: TerrainGeometry, game: Game) {
        super();
        this.game = game;
        this.highlightRadius = terrain.hexagonWorldRadius * 0.2;
        this.highlightHeight = this.highlightRadius * 0.5;
        this.placementGoal = PositionStateType.EMPTY;

        this.regions = [];

        document.addEventListener('click', this.onClick.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    /**
     * Updates locations of the placeable areas
     * @param indexWorldLocations List of tuples. FIrst element of tuple is index location and second is the world location
     */
    updateLocations(indexWorldLocations: [THREE.Vector3, THREE.Vector2][], placementGoal: PositionStateType) {
        this.placementGoal = placementGoal;

        // Remove current meshes
        this.empty();

        // Create and add new highlight regions
        indexWorldLocations.forEach(([indexLocation, worldPosition]) => {

            const cylinder = new THREE.CylinderGeometry(
                this.highlightRadius, this.highlightRadius, this.highlightHeight,
                32, 1, false);
            cylinder.translate(worldPosition.x, 0, worldPosition.y);
            colorGeometry(cylinder, new THREE.Color(this.baseHighlightColor));

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.5,
                emissive: this.baseHighlightColor,
                specular: 0xffffff,
                shininess: 30
            });

            const highlightRegion = new HighlightRegion(cylinder, material, indexLocation);
            this.regions.push(highlightRegion);
            super.add(highlightRegion);
        });
    }

    empty() {
        this.regions.forEach((region) => {
            super.remove(region);
        });
        this.regions = [];
    }

    // A user clicked on a particular highlighted region.
    onClick(mouseEvent: MouseEvent) {
        const raycaster = this.game.getRaycaster(mouseEvent);
        const intersects = raycaster.intersectObjects(this.regions);

        // User should only be able to click on a single region.
        if (intersects.length === 1) {
            const highlightedRegion = intersects[0].object as HighlightRegion;

            // Add a house
            this.game.placeRoadOrSettlement(highlightedRegion.indexLocation, this.placementGoal);
        }
    }

    onMouseMove(mouseEvent: MouseEvent) {
        const raycaster = this.game.getRaycaster(mouseEvent);
        const intersects = raycaster.intersectObjects(this.regions);

        // Unhighlight previous region
        if (this.hoveredMesh != null) {
            this.hoveredMesh.phongMaterial.emissive = new THREE.Color(this.baseHighlightColor);
        }

        if (intersects.length > 0) {
            const highlightedRegion = intersects[0].object as HighlightRegion;
            this.hoveredMesh = highlightedRegion;
            // Highlight this region
            highlightedRegion.phongMaterial.emissive = new THREE.Color(this.hoverHighlightColor);
        }
    }
    
}