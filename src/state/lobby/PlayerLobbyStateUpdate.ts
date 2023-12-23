export enum PlayerLobbyStateUpdateType {
    LEAVING, JOINING, UPDATING
}

export interface IPlayerLobbyStateUpdate {
    updateType: PlayerLobbyStateUpdateType;
    playerID: string;
    playerName: string;
    playerColor: string;
    isHost: boolean;
}

export class PlayerLobbyStateUpdate implements IPlayerLobbyStateUpdate {
    constructor(
        public updateType: PlayerLobbyStateUpdateType,
        public playerID: string,
        public playerName: string,
        public playerColor: string,
        public isHost: boolean
    ) {}
}