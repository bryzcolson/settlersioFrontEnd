export enum MenuStateUpdateType {
    START_GAME, END_GAME
}

export interface IMenuStateUpdate {
    updateType: MenuStateUpdateType;
}

export class MenuStateUpdate implements IMenuStateUpdate {
    updateType: MenuStateUpdateType;
    constructor(updateType: MenuStateUpdateType) {
        this.updateType = updateType;
    }
}

// this class might actually be pointless...
// depends if menu state is really used by anything but the menu manager that already handles stuff
export class MenuState {
    gameRunning: boolean;

    constructor() {
        this.gameRunning = false;
    }

    update(stateUpdate: IMenuStateUpdate) {
        if (stateUpdate.updateType == MenuStateUpdateType.END_GAME) {
            // TODO
        } else if (stateUpdate.updateType == MenuStateUpdateType.START_GAME) {
            this.gameRunning = true;
        }
        //TODO: listeners?
    }
}