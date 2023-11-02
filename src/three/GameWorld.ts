import * as THREE from 'three';
import { GameObject } from '../GameObjects/GameObject';

/**
 * Simple object to hold all our game objects and update them
 */
export class GameWorld {
    scene: THREE.Scene;
    gameObjects: GameObject[];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.gameObjects = [];
    }

    addGameObject(gameObject: GameObject) {
        this.gameObjects.push(gameObject);
        this.scene.add(gameObject);
    }

    removeGameObject(gameObject: GameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        this.gameObjects.splice(index, 1);
    }

    update(deltaTime: number, timestamp:number) {
        this.gameObjects.forEach((gameObject) => {
            gameObject.update(deltaTime);
        });
    }
}