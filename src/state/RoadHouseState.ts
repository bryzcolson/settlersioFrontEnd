import { Vector2, Vector3 } from 'three';
import { TileType } from '../utility/Tile';
import { PositionState, PositionStateType } from './PositionState';
import { GameWorld } from '../three/GameWorld';


/**
 * Computes world XZ coordinates for a hexagon corner.
 */
export function getXZPosition(i:number, j:number, k:number, r: number): Vector2 {
    // X calculation
    let kmod; // x offset from k=2 depending on k
    if (k === 0) {
        kmod = -0.75*r;
    } else if (k === 1) {
        kmod = -0.5*r;
    } else if (k === 2) {
        kmod = 0;
    } else if (k === 3) {
        kmod = 0.5*r;
    } else { // k===4
        kmod = 0.75*r;
    }

    const x = -0.5*r + 1.5*r*i + kmod;

    // Y Calculation
    const hexHeight = Math.sqrt(3)*r;
    if (k === 1 || k === 2 || k === 3) {
        kmod = 0;
    } else {
        kmod = -0.25 * hexHeight;
    }

    let startY:number;
    if (i % 2 === 0) {
        startY = 0.5 * hexHeight;
    } else {
        startY = 0;
    }
    const y = startY + hexHeight*j + kmod;

    return new Vector2(x,y);
}


/**
 * Given a corner of a hexagon that can hold a house, finds the 3 closest coordinates for other houses.
 */
function getHousesOneAway(i:number, j:number, k:number): Vector3[] {
    if (i % 2 === 0) {
        if (k === 0) {
            return [
                new Vector3(i-1,j, 3),
                new Vector3(i,j, 1),
            ];
        }
        if (k === 1) {
            return [
                new Vector3(i-1, j, 3),
                new Vector3(i-1, j+1, 3),
                new Vector3(i, j, 3),
            ];
        }
        if (k === 2) {
            return [
                new Vector3(i,j,1),
                new Vector3(i,j,3),
            ];
        }
        if (k === 3) {
            return [
                new Vector3(i, j, 1),
                new Vector3(i+1, j, 1),
                new Vector3(i+1, j+1, 1),
            ];
        }
        // k === 4
        return [
            new Vector3(i,j,3),
            new Vector3(i+1,j,1),
        ];
    }
    // odd i
    if (k === 0) {
        return [
            new Vector3(i,j,1),
            new Vector3(i-1,j-1,3),
        ];
    }
    if (k === 1) {
        return [
            new Vector3(i-1, j, 3),
            new Vector3(i-1, j-1, 3),
            new Vector3(i, j, 3),
        ];
    }
    if (k === 2) {
        return [
            new Vector3(i,j,1),
            new Vector3(i,j,3),
        ];
    }
    if (k === 3) {
        return [
            new Vector3(i, j, 1),
            new Vector3(i+1, j, 1),
            new Vector3(i+1, j-1, 1),
        ];
    }
    // k === 4
    return [
        new Vector3(i,j,3),
        new Vector3(i+1,j-1,1),
    ];

}

/**
 * Given an ijk position, finds the nearest road ijk positions.
 * Does NOT filter out positions that are out of bounds or invalid.
 * @return list of each road position as a vector3 where x=i, y=j, z=k
 */
function getRoadsOneAway(i:number, j:number, k:number): Vector3[] {
    if (i % 2 === 0) {
        if (k === 0) {
            return [
                new Vector3(i-1, j, 2),
                new Vector3(i-1, j, 4),
                new Vector3(i, j, 2),
                new Vector3(i-1, j+1, 4),
            ];
        }
        if (k === 1) {
            return [
                new Vector3(i, j, 0),
                new Vector3(i, j, 2),
                new Vector3(i-1, j+1, 4),
            ];
        }
        if (k === 2) {
            return [
                new Vector3(i, j, 0),
                new Vector3(i, j, 4),
                new Vector3(i - 1, j + 1, 4),
                new Vector3(i + 1, j + 1, 0),
            ];
        }
        if (k === 3) {
            return [
                new Vector3(i, j, 2),
                new Vector3(i, j, 4),
                new Vector3(i+1, j+1, 0),
            ];

        }
        // k === 4
        return [
            new Vector3(i,j, 2),
            new Vector3(i + 1, j, 0),
            new Vector3(i+1, j, 2),
            new Vector3(i+1, j+1, 0),
        ];
    }
    // odd i
    if (k === 0) {
        return [
            new Vector3(i-1, j-1, 2),
            new Vector3(i-1, j-1, 4),
            new Vector3(i,j, 2),
            new Vector3(i-1, j, 4),
        ];
    }
    if (k === 1) {
        return [
            new Vector3(i, j, 0),
            new Vector3(i, j, 2),
            new Vector3(i-1, j, 4),
        ]; //
    }
    if (k === 2) {
        return [
            new Vector3(i,j, 0),
            new Vector3(i,j, 4),
            new Vector3(i+1, j, 0),
            new Vector3(i-1, j, 4),
        ];
    }
    if (k === 3) {
        return [
            new Vector3(i, j, 2),
            new Vector3(i, j, 4),
            new Vector3(i+1, j, 0),
        ];
    }
    // k === 4
    return [
        new Vector3(i,j, 2),
        new Vector3(i+1, j, 0),
        new Vector3(i+1, j-1, 0),
        new Vector3(i+1, j-1, 2),
    ];

    return [];
}

/**
 * Finds which hexagon game tiles are surrounding an i,j,k coordinate. Returns coordinates, not actual tiles.
 * NOTE: May return coordinates that are out of bounds.
 */
function getAdjacentTiles(i:number, j:number, k:number): Vector2[] {
    // Even i value tiles have different rules because of offset
    if (i % 2 === 0) {
        if (k === 0) {
            return [
                new Vector2(i-2, j),
                new Vector2(i-1, j-1),
            ];
        }
        if (k === 1) {
            return [
                new Vector2(i-2, j),
                new Vector2(i-1, j-1),
                new Vector2(i-1, j),
            ];
        }
        if (k === 2) {
            return [
                new Vector2(i-1, j-1),
                new Vector2(i-1, j),
            ];
        }
        if (k === 3) {
            return [
                new Vector2(i-1, j-1),
                new Vector2(i-1, j),
                new Vector2(i, j),
            ];
        }
        // k === 4
        return [
            new Vector2(i-1, j-1),
            new Vector2(i, j),
        ];
    }
    // odd i value
    if (k === 0) {
        return [
            new Vector2(i-1, j-1),
            new Vector2(i-2,j-1)
        ];
    }
    if (k === 1) {
        return [
            new Vector2(i-1, j-1),
            new Vector2(i-2,j-1),
            new Vector2(i-1, j)
        ];
    } 
    if (k === 2) {
        return [
            new Vector2(i-1, j-1),
            new Vector2(i-1, j)
        ];
    }
    if (k === 3) {
        return [
            new Vector2(i-1, j-1),
            new Vector2(i,j-1),
            new Vector2(i-1, j)
        ];
    }
    // k === 4
    return [
        new Vector2(i-1, j-1),
        new Vector2(i, j-1)
    ];
}

/**
 * Checks if a given i,j,k state position is in the bounds of the map.
 * @param i goes along x axis (which column)
 * @param j goes along y axis (which row)
 * @param k 0-4 which corner along the bottom of the hexagon
 * @param tileTypes the map tile types. Needed for width and height
 * @param adjacentTilesParam Optional list of tiles adjacent to this point. Will be used for computation
 * @returns 
 */
function isStatePositionInBounds(i:number, j:number, k:number, tileTypes:TileType[][], adjacentTilesParam?: Vector2[]) {
    const w = tileTypes.length;
    const h = tileTypes[0].length;

    // Optional parameter to save calling adjacent tiles twice
    let adjacentTiles = adjacentTilesParam;
    if (adjacentTiles === undefined) {
        adjacentTiles = getAdjacentTiles(i, j, k);
    }

    // If no tiles around this point are in bounds, then this is out of bounds
    let isAtLeastOneTileValid = false;
    adjacentTiles.forEach((tile) => {
        if (tile.x >= 0 && tile.x < w && 
            tile.y >= 0 && tile.y < h) {
            isAtLeastOneTileValid = true;
        }
    });
    return isAtLeastOneTileValid;
}
function isStatePositionInBoundsVec(ijk: THREE.Vector3, tileTypes:TileType[][], adjacentTilesParam?: Vector2[]) {
    if (adjacentTilesParam === undefined) return isStatePositionInBounds(ijk.x, ijk.y, ijk.z, tileTypes);
    return isStatePositionInBounds(ijk.x, ijk.y, ijk.z, tileTypes, adjacentTilesParam);
}

/**
 * Checks if a world tile is in the bounds of the world grid
 * @param i the i position of the tile
 * @param j the j position of the tile
 * @param tileTypes The world grid of tile types
 * @returns True if contained in the grid, false otherwise
 */
function isTilePositionInBounds(i:number, j:number, tileTypes:TileType[][]) {
    return !(i < 0 ||
        j < 0 ||
        i >= tileTypes.length ||
        j >= tileTypes[0].length);  
}

/**
 * Determines if an i,j,k location is valid to place a house that doesn't need to be connected to a road.
 * Used at the begining of a game to allow players to place houses anywhere on the map.
 */
function validHouseLocationDisconnected(i:number, j:number, k:number, tileTypes:TileType[][],
        state:PositionState[][][]): boolean {
    // Houses can only be on corners of hexagons
    if (k === 0 || k === 2 || k === 4) return false;

    // Must be in bounds
    const adjacentTiles = getAdjacentTiles(i, j, k);
    if (!isStatePositionInBounds(i, j, k, tileTypes, adjacentTiles)) return false;

    // At least one tile non water
    let atLeastOneNotWater = false;
    adjacentTiles.forEach((tile) => {
        if (isTilePositionInBounds(tile.x, tile.y, tileTypes) &&
            tileTypes[tile.x][tile.y] !== TileType.WATER) {
            atLeastOneNotWater = true;
        }
    });
    if (!atLeastOneNotWater) return false;

    // Can't be next to another house
    const adjacentHouseCoords = getHousesOneAway(i, j, k);
    let atLeastOneHouseAdjacent = false;
    adjacentHouseCoords.forEach((houseCoord) => {
        if (isStatePositionInBoundsVec(houseCoord, tileTypes) &&
        state[houseCoord.x][houseCoord.y][houseCoord.z].type !== PositionStateType.EMPTY) {
            atLeastOneHouseAdjacent = true;
        }
    });
    if (atLeastOneHouseAdjacent) return false;

    // Can't be a house/town already in this position
    return state[i][j][k].type === PositionStateType.EMPTY;
}

/**
 * Determines if an i,j,k position state is valid to place a house in that is connected to the road network.
 * Used AFTER the initial house placements.
 */
function validHouseLocationConnected(i:number, j:number, k:number, tileTypes:TileType[][],
        state:PositionState[][][], playerName: String): boolean {

    // Houses only placed on k == 1 and 3
    if (k !== 1 && k !== 3) return false;

    // Must be valid disconnected
    const isValidDisconnected = validHouseLocationDisconnected(i,j,k, tileTypes, state);
    if (!isValidDisconnected) return false;

    // Must be connected to a road that is owned by the same player
    let connectedToAtLeastOneRoad = false;
    const adjacentRoads = getRoadsOneAway(i,j,k);
    adjacentRoads.forEach((roadPos) => {
        if (isStatePositionInBoundsVec(roadPos, tileTypes)) {
            const stateAtPos = state[roadPos.x][roadPos.y][roadPos.z];
            if (stateAtPos.type !== PositionStateType.EMPTY && stateAtPos.player === playerName) {
                connectedToAtLeastOneRoad = true;
            }
        }
    });

    return connectedToAtLeastOneRoad;
}

function validRoadLocation(i:number, j:number, k:number, tileTypes:TileType[][],
        state:PositionState[][][], playerName: String): boolean {
    // Roads only placed on k = 0, 2, 4
    if (k !== 0 && k !== 2 && k !== 4) return false;

    // Must be in bounds
    if (!isStatePositionInBounds(i,j,k,tileTypes)) return false;
    
    // Can't already have a road there
    if (state[i][j][k].type !== PositionStateType.EMPTY) return false;

    // At least one tile non water
    let atLeastOneNotWater = false;
    const adjacentTiles = getAdjacentTiles(i,j,k);
    adjacentTiles.forEach((tile) => {
        if (isTilePositionInBounds(tile.x, tile.y, tileTypes) &&
            tileTypes[tile.x][tile.y] !== TileType.WATER) {
            atLeastOneNotWater = true;
        }
    });
    if (!atLeastOneNotWater) return false;

    // If next to own house, gauranteed to be able to place
    const adjacentHousesPositions = getHousesOneAway(i,j,k);
    let hasOwnHouseAdjacent = false;
    adjacentHousesPositions.forEach((housePos) => {
        if (isStatePositionInBoundsVec(housePos, tileTypes)) {
            const houseStateAtPos = state[housePos.x][housePos.y][housePos.z];
            if (houseStateAtPos.type !== PositionStateType.EMPTY &&
                    houseStateAtPos.player === playerName) {
                hasOwnHouseAdjacent = true;
            }
        }
    });
    if (hasOwnHouseAdjacent) return true;
    
    // Must be connected to another road of same player OR a house
    let playerAdjacentRoads:THREE.Vector3[] = [];
    const adjacentRoads = getRoadsOneAway(i,j,k);
    adjacentRoads.forEach((roadPos) => {
        if (isStatePositionInBoundsVec(roadPos, tileTypes)) {
            const stateAtPos = state[roadPos.x][roadPos.y][roadPos.z];
            if (stateAtPos.type === PositionStateType.ROAD && stateAtPos.player === playerName) {
                playerAdjacentRoads.push(roadPos);
            }
        }
    });
    if (playerAdjacentRoads.length === 0) return false;

    // Can't cross over another players settlement
    // Filter out roads from our list that are blocked by another settlement
    adjacentHousesPositions.forEach((housePos) => {
        if (isStatePositionInBoundsVec(housePos, tileTypes)) {
            const houseStateAtPos = state[housePos.x][housePos.y][housePos.z];
            // Only care about houses the player doesn't own themselves
            if (houseStateAtPos.type !== PositionStateType.EMPTY &&
                    houseStateAtPos.player !== playerName) {
                const roadPositionsBlockedByThisHouse = getRoadsOneAway(housePos.x, housePos.y, housePos.z);
                playerAdjacentRoads = playerAdjacentRoads.filter((value, index, array) => {
                    return !roadPositionsBlockedByThisHouse.includes(value);
                });
            }
        }
    });

    return playerAdjacentRoads.length > 0;
}


/**
 * State storage for every single corner of all hexagon tiles and whether they are empty or have a road/house.
 * No duplicates. States stored in a 3d array where i,j are closely related to the game tiles i,j but slightly offset
 * Duplicates avoided by only using the bottom section of the hexagon to have no overlap.
 * 
 * For more info, see HERE (TODO LINK)
 * 
 * Only these bottom points of the hexagon are included. From left to right is the k coordinate.
 * .       .       0       4
 *  \._._./         \1_2_3/
 */
export class RoadHouseState {
    width: number;

    height: number;

    depth: number;

    stateArray: PositionState[][][];

    tileTypes: TileType[][];

    constructor(tileTypes:TileType[][]) {
        this.tileTypes = tileTypes;

        this.width = tileTypes.length + 2;
        this.height = tileTypes[0].length + 1;
        this.depth = 5;
        this.stateArray = [];
        for (let i = 0; i < this.width; i++) {
            this.stateArray[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.stateArray[i][j] = [];
                for (let k = 0; k < this.depth; k++) {
                    this.stateArray[i][j][k] = new PositionState('empty_position', PositionStateType.EMPTY, "");
                }
            }
        }
    }

    /**
     * inserts a house/road at the location given inside the state array. Does NOT place in the game world.
     * @param indexLocation the location to add the house
     */
    putState(indexLocation: THREE.Vector3, placementGoal: PositionStateType, playerName: string, playerColor: string) {
        this.stateArray[indexLocation.x][indexLocation.y][indexLocation.z] =
            new PositionState(playerName, placementGoal, playerColor);
    }

    getPossiblePlacementLocations(placementGoal: PositionStateType, detached: boolean, player: string) {
        const possibleLocations = [];
        for (let i = 0 ; i < this.width; i++ ) {
            for (let j = 0; j < this.height; j++) {
                for (let k = 0; k < this.depth; k++) {
                    switch (placementGoal) {
                        case PositionStateType.EMPTY:
                            possibleLocations.push(new Vector3(i,j,k));
                            break;
                        case PositionStateType.CITY:
                            //TODO
                            break;
                        case PositionStateType.ROAD:
                            if (validRoadLocation(i,j,k, this.tileTypes, this.stateArray, player)) {
                                possibleLocations.push(new Vector3(i,j,k));
                            }
                            break;
                        case PositionStateType.TOWN:
                            if (detached && validHouseLocationDisconnected(i,j,k, this.tileTypes, this.stateArray)) {
                                possibleLocations.push(new Vector3(i,j,k));
                            }
                            else if (validHouseLocationConnected(i,j,k, this.tileTypes, this.stateArray, player)) {
                                possibleLocations.push(new Vector3(i,j,k));
                            }
                            break;
                    }
                }
            }
        }
        return possibleLocations;
    }

    getArray() {
        return this.stateArray;
    }

}