import { PositionStateType } from '../state/PositionState';
import { GamePlacingHouseState } from '../state/state_machine/GamePlacingHouseState';
import { GameWaitingState } from '../state/state_machine/GameWaitingState';
import { GameYourTurnState } from '../state/state_machine/GameYourTurnState';
import { Game } from "../state/Game";

enum ACTIVE_BUTTON {
    NONE,
    HOUSE_DISCONNECTED, // At beginning of game house can be placed anywhere
    HOUSE_CONNECTED, // House must be attached to road in middle of the game
    CITY, ROAD
};
let currentButton = ACTIVE_BUTTON.NONE;

export class HouseUI {
    constructor(game: Game) {
        // Create UI elements
        const bottomBox = document.createElement('div'); 
        bottomBox.id = 'bottom-ui-box';
        const placeHouseDetachedButton = document.createElement('button');
        placeHouseDetachedButton.innerText = 'Detached House Test Add';
        const placeHouseButton = document.createElement('button');
        placeHouseButton.innerText = 'Connected House Test Add';
        const placeRoadButton = document.createElement('button');
        placeRoadButton.innerText = 'Add road test';

        // Add listeners
        placeHouseDetachedButton.addEventListener('click', () => {
            currentButton = ACTIVE_BUTTON.HOUSE_DISCONNECTED;
            game.addHighlightedAreas(PositionStateType.TOWN, true);
        });
        placeHouseButton.addEventListener('click', () => {
            currentButton = ACTIVE_BUTTON.HOUSE_CONNECTED;
            game.addHighlightedAreas(PositionStateType.TOWN, false);
        });
        placeRoadButton.addEventListener('click', () => {
            currentButton = ACTIVE_BUTTON.ROAD;
            game.addHighlightedAreas(PositionStateType.ROAD, false);
        });

        // Append to document
        bottomBox.appendChild(placeHouseDetachedButton);
        bottomBox.appendChild(placeHouseButton);
        bottomBox.appendChild(placeRoadButton);
        document.body.append(bottomBox);
    }
}
