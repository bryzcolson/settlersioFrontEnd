import { IPlayerLobbyState, PlayerLobbyState } from "./PlayerLobbyState";
import { PlayerLobbyStateUpdate, PlayerLobbyStateUpdateType } from "./PlayerLobbyStateUpdate";

export interface ILobbyState {
    players: IPlayerLobbyState[];
}

export class LobbyState implements ILobbyState {
    players: IPlayerLobbyState[];

    constructor() {
        this.players = [];
    }

    update(playerLobbyStateUpdate: PlayerLobbyStateUpdate) {
        const updateType = playerLobbyStateUpdate.updateType;
        switch (updateType) {
            case PlayerLobbyStateUpdateType.JOINING:
                this.players.push(new PlayerLobbyState(playerLobbyStateUpdate.playerID,
                    playerLobbyStateUpdate.playerName,
                    playerLobbyStateUpdate.playerColor,
                    playerLobbyStateUpdate.isHost))
                break;
            case PlayerLobbyStateUpdateType.LEAVING:
                break;
            case PlayerLobbyStateUpdateType.UPDATING:
                break;
        }
    }

    fullUpdate(lobbyState: ILobbyState) {
        this.players = lobbyState.players;
    }

    getHost() {
        for (const player of this.players) {
            if (player.isHost) {
                return player;
            }
        }
        return null;
    }

    getPlayer(playerID: string) {
        for (const player of this.players) {
            if (player.playerID == playerID) {
                return player;
            }
        }
        return null;
    }
}