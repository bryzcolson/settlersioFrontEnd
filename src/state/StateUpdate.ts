
export enum StateUpdateType {
    UNKNOWN,
    FULL_STATE,
    FULL_LOBBY_STATE,
    ROAD_HOUSE_STATE,
    PLAYER_JOINED,
    MENU_STATE_UPDATE,
}

export interface IStateUpdate {
    intendedTarget: string | null; // Who do we want to send this to (user ID). Null if everyone
    updateData: Object;
    updateType: StateUpdateType;
}

export class StateUpdate implements IStateUpdate {
    intendedTarget: string | null;
    updateData: Object;
    updateType: StateUpdateType;

    constructor(updateData: Object, updateType: StateUpdateType, intendedTarget: string | null) {
        this.updateData = updateData;
        this.updateType = updateType;
        this.intendedTarget = intendedTarget;
    }
}