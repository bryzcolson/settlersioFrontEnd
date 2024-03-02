import { StateUpdateType, StateUpdate } from "../state/StateUpdate";
import { PlayerLobbyStateUpdate, PlayerLobbyStateUpdateType } from "../state/lobby/PlayerLobbyStateUpdate";
import { AppSync } from "./AWSAppSync";
import { GameBox } from "./GameMenu";
import { LobbyMenu } from "./LobbyMenu";
import { MainMenu } from "./MainMenu";
import { randomPlayerColor, randomPlayerName } from "../Utility/PlayerRandomizer";
import { ThreeJSCanvas } from "./ThreeJSCanvas";
import { LoadingMenu } from "./LoadingMenu";
import { StateUpdateController } from "../state/StateUpdateController";
import { AWSWebSocketConnector } from "./AWSWebSocketConnector";

export class MenuManager {
    mainMenu: MainMenu;
    lobbyMenu: LobbyMenu;
    gameBox: GameBox;
    loadingMenu: LoadingMenu;

    // appSync: AppSync;

    stateUpdateController: StateUpdateController;
    websocketConnector: AWSWebSocketConnector;


    constructor() {
        // this.appSync = new AppSync(this);
        this.websocketConnector = new AWSWebSocketConnector();
        
        this.stateUpdateController = new StateUpdateController(this);

        this.mainMenu = new MainMenu(this);
        this.lobbyMenu = new LobbyMenu(this);
        this.gameBox = new GameBox(this);
        this.loadingMenu = new LoadingMenu(this);

        // Auto-join lobby
        let params = new URLSearchParams(document.location.search);
        let lobbyName = params.get("lobbyName");
        if (lobbyName != null) {
            this.switchToLobbyMenu(lobbyName, false, null, null);  
        }
    }

    switchToMainMenu() {
        this.hideAll();
        this.mainMenu.show();
    }

    switchToLobbyMenu(lobbyName: string, newLobby: boolean, playerName: string | null, playerColor: string | null) {
        this.hideAll();
        this.loadingMenu.show();

        if (playerName == null) {
            playerName = randomPlayerName();
        }
        if (playerColor == null) {
            playerColor = randomPlayerColor();
        }

        const onConnectionSuccess = () => {
            const playerUpdate = new PlayerLobbyStateUpdate(
                PlayerLobbyStateUpdateType.JOINING,
                "", // this.appSync.userID,
                playerName!, // Typescript checking not working here for some resaon?
                playerColor!,
                newLobby
            );
            const stateUpdate = new StateUpdate(
                playerUpdate,
                StateUpdateType.PLAYER_JOINED,
                null
            );
            this.stateUpdateController.updateLocalData(stateUpdate);
            // this.appSync.publish(stateUpdate);

            this.lobbyMenu.setLobbyNameDisplay(lobbyName);
            this.hideAll();
            this.lobbyMenu.show();
        }
        // this.appSync.subscribe(lobbyName, onConnectionSuccess);
        if (newLobby) {
            console.log("NEW LOBBY TIME");
            this.websocketConnector.createLobby(onConnectionSuccess);
        }
        else {
            console.log("SECOND");
            this.websocketConnector.joinLobby(lobbyName, onConnectionSuccess);
        }
    }

    switchToGame() {
        this.hideAll();
        this.gameBox.show();
        ThreeJSCanvas(this.stateUpdateController.fullState, this.stateUpdateController);
    }

    hideAll() {
        this.mainMenu.hide();
        this.lobbyMenu.hide();
        this.gameBox.hide();
        this.loadingMenu.hide();
    }
}