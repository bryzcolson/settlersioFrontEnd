import { Object3D } from "three";

// Class for adding custom logic to threejs objects
export abstract class GameObject extends Object3D{
    // Updates the objects underlying data.
    public update(_deltaTime: number): void { 
        // Do nothing by default - overrideable
    }
}

