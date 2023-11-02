import { RoadHouseState } from './RoadHouseState';
import { TileState } from './TileState';

export class GameState {
    roadHouseState: RoadHouseState;
    tileState: TileState;
    //TODO:
    // PlayersState (number of players, names, colors, what cards they have)
    // RobberState (where the robber is)

    constructor() {
        this.tileState = new TileState();
        this.roadHouseState = new RoadHouseState(this.tileState.tileTypes);
    }
}