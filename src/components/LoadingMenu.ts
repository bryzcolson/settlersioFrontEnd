import { AbstractMenuContainer } from "./AbstractMenuContainer";
import { MenuManager } from "./MenuManager";

export class LoadingMenu extends AbstractMenuContainer {

    constructor(menuManager: MenuManager) {
        super(document.getElementById("loading_menu")!);
    }

}