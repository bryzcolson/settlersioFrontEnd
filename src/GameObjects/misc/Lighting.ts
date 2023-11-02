import { AmbientLight, PointLight } from "three";
import { GameObject } from "../GameObject";

export class Lighting extends GameObject {
    constructor() {
        super();
        const ambientLight = new AmbientLight('white', 0.4);
        const pointLight = new PointLight('#ffdca8', 1.2, 100);
        pointLight.position.set(5, 15, 12);
        pointLight.castShadow = true;
        pointLight.shadow.radius = 4;
        pointLight.shadow.camera.near = 0.5;
        pointLight.shadow.camera.far = 4000;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        super.add(ambientLight);
        super.add(pointLight);
    }
}