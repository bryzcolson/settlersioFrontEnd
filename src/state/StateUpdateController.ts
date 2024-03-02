import { AppSync } from "../components/AWSAppSync";
import { MenuManager } from "../components/MenuManager";
import { FullState } from "./FullState";
import { Game } from "./Game";
import { IMenuStateUpdate, MenuStateUpdateType } from "./MenuState";
import { IRoadHouseStateUpdate } from "./RoadHouseStateUpdate";
import { IStateUpdate, StateUpdate, StateUpdateType } from "./StateUpdate";
import { ILobbyState } from "./lobby/LobbyState";
import { IPlayerLobbyStateUpdate } from "./lobby/PlayerLobbyStateUpdate";

export class StateUpdateController {

    game: Game | undefined;
    fullState: FullState;
    // appSync: AppSync;
    menuManager: MenuManager;

    constructor(menuManager: MenuManager) {
        this.menuManager = menuManager;
        // this.appSync = appSync;
        this.fullState = new FullState();
    }

    setGame(game: Game) {
        this.game = game;
    }

    updateLocalData(update: IStateUpdate) {
        const updateData = update.updateData;
            switch (update.updateType) {
                case StateUpdateType.FULL_STATE:
                    //TODO: this will be used later if i add hotjoining or something
                    break;
                case StateUpdateType.ROAD_HOUSE_STATE:
                    const roadHouseStateUpdate = updateData as IRoadHouseStateUpdate;
                    this.game!.serverRoadStateUpdate(roadHouseStateUpdate);
                    break;
                case StateUpdateType.PLAYER_JOINED:
                    const playerUpdate = updateData as IPlayerLobbyStateUpdate;
                    this.fullState.lobbyState.update(playerUpdate);
                    this.menuManager.lobbyMenu.updateFromState();
                    // Send game state to player who just joined (if host)
                    const hostPlayer = this.fullState.lobbyState.getHost();
                    if (hostPlayer != null ) { //&& hostPlayer!.playerID == this.appSync.userID) {
                        const stateUpdate = new StateUpdate(
                            this.fullState.lobbyState,
                            StateUpdateType.FULL_LOBBY_STATE,
                            playerUpdate.playerID
                        );
                        // this.appSync.publish(stateUpdate);
                    }
                    break;
                case StateUpdateType.FULL_LOBBY_STATE:
                    const lobbyState = updateData as ILobbyState;
                    this.fullState.lobbyState.fullUpdate(lobbyState);
                    this.menuManager.lobbyMenu.updateFromState();
                case StateUpdateType.MENU_STATE_UPDATE:
                    const menuStateUpdate = updateData as IMenuStateUpdate;
                    if (menuStateUpdate.updateType == MenuStateUpdateType.START_GAME) {
                        this.menuManager.switchToGame();
                    }
                case StateUpdateType.UNKNOWN:
                    break;
            }
    }
}