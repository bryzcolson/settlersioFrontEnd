export interface IPlayerLobbyState {
    playerID: string;
    playerName: string;
    playerColor: string;

    isHost: boolean;
}

export class PlayerLobbyState implements IPlayerLobbyState{
    constructor(
        public playerID: string,
        public playerName: string,
        public playerColor: string,
        public isHost: boolean
    ) {}
}