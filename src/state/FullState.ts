import { MenuState } from './MenuState';
import { RoadHouseState } from './RoadHouseState';
import { TileState } from './TileState';
import { LobbyState } from './lobby/LobbyState';


export class FullState {
    menuState: MenuState;
    lobbyState: LobbyState;
    roadHouseState: RoadHouseState;
    tileState: TileState;
    //TODO:
    // RobberState (where the robber is)

    constructor() {
        this.lobbyState = new LobbyState();
        this.tileState = new TileState();
        this.menuState = new MenuState();
        this.roadHouseState = new RoadHouseState(this.tileState.tileTypes);
    }

    
}