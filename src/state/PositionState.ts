export enum PositionStateType {
    TOWN,
    CITY,
    ROAD,
    EMPTY,
}

/**
 * The state at a particular corner of a hexagon. house/road and what player owns it.
 */
export class PositionState {
    player: String|null;
    
    type: PositionStateType;

    constructor(player:String, type: PositionStateType) {
        this.player = player;
        this.type = type;
    }
}