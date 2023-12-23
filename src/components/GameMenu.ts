import { AbstractMenuContainer } from "./AbstractMenuContainer";
import { MenuManager } from "./MenuManager";
import { ThreeJSCanvas } from "./ThreeJSCanvas";

export class GameBox extends AbstractMenuContainer {
    constructor(menuManager: MenuManager) {
        super(document.getElementById("game_box")!);
    }
}