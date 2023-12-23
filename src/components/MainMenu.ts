import { generateUUID } from "three/src/math/MathUtils";
import { AppSync } from "./AWSAppSync";
import { MenuManager } from "./MenuManager";
import { AbstractMenuContainer } from "./AbstractMenuContainer";
import { randomPlayerColor } from "../Utility/PlayerRandomizer";

export class MainMenu extends AbstractMenuContainer {

    constructor(menuManager: MenuManager) {
        super(document.getElementById("main_menu")!);
        const createRoomInputButton = document.getElementById("create_room_input_button")!;
        const playerColorInput = document.getElementById("main_menu_player_color_input")! as HTMLInputElement;
        const playerNameInput = document.getElementById("main_menu_player_name_input")! as HTMLInputElement;

        playerColorInput.value = randomPlayerColor();

        createRoomInputButton.onclick = () => {
            const lobbyName = Math.floor(Math.random()* 10000).toString();
            let playerName: string | null = playerNameInput.value;
            const playerColor = playerColorInput.value;

            if (playerName == "") {
                playerName = null;
            }
            menuManager.switchToLobbyMenu(lobbyName, true, playerName, playerColor);
        }
    }

}