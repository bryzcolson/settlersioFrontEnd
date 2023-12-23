export abstract class AbstractMenuContainer {
    topLevelContainer: HTMLElement;

    constructor(topLevelContainer: HTMLElement) {
        this.topLevelContainer = topLevelContainer;
    }

    show() {
        this.topLevelContainer.style.display = "block";
    }

    hide() {
        this.topLevelContainer.style.display = "none";
    }
}