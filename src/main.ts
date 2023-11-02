import { ThreeJSCanvas } from "./components/ThreeJSCanvas";
import { GameState } from "./state/GameState";

onload = () => {
    //TODO: Get state from server
    const tempInitialState = new GameState();

    ThreeJSCanvas(tempInitialState);
}
