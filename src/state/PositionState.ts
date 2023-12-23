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
    color: string;
    
    type: PositionStateType;

    constructor(player:String, type: PositionStateType, color: string) {
        this.player = player;
        this.type = type;
        this.color = color;
    }
}