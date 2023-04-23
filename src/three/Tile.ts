import * as THREE from 'three';
import { Hexagon } from './Hexagon';
import { Noise } from './Noise';
import { NoiseFactory } from './NoiseFactory';

export enum TileType {
    SHEEP,
    WHEAT,
    STONE,
    BRICK,
    WOOD,
    WATER,
    DESERT,
}

export class Tile {
    outerHexagon: Hexagon;

    innerHexagon: Hexagon;

    noiseMap: Noise;

    tileType: TileType;

    shouldClampDistToCenterHexagon: boolean;

    constructor(x: number, y: number, innerRadius: number, outerRadius: number, tileType: TileType) {
        // Initialize variables
        this.innerHexagon = new Hexagon(x, y, innerRadius);
        this.outerHexagon = new Hexagon(x, y, outerRadius);
        this.tileType = tileType;
        this.noiseMap = NoiseFactory.noiseFromTileType(this.tileType, this.innerHexagon);

        // Tall peak in the middle looks good for the mountains but not others.
        if (tileType === TileType.STONE) {
            this.shouldClampDistToCenterHexagon = false;
        } else {
            this.shouldClampDistToCenterHexagon = true;
        }
    }

    /**
     * Computes if a world coordinate lies within the boundaries of this Tile
     * @param x world x coordinate
     * @param y world y coordinate
     */
    doesOwnPoint(position: THREE.Vector2): boolean {
        return this.outerHexagon.distanceToHexagon(position.x, position.y) > 0;
    }

    getHeight(position: THREE.Vector2): number {
        if (this.shouldClampDistToCenterHexagon) {
            const distanceScaling = this.innerHexagon.clampedDistanceToHexagon(position.x, position.y) /
                this.innerHexagon.radius;
            return distanceScaling * this.noiseMap.getPerlin(position.x, position.y);
        }
        const distanceScaling = this.innerHexagon.distanceToHexagon(position.x, position.y) / this.innerHexagon.radius;
        return distanceScaling * this.noiseMap.getPerlin(position.x, position.y);
    
    }

    getColor(): number[] {
        if (this.tileType === TileType.SHEEP) {
            return [121, 208 + Math.random() * 15, 33 + Math.random() * 15];
        }
        if (this.tileType === TileType.STONE) {
            return [181, 191 + Math.random() * 15, 190 + Math.random() * 15];
        }
        if (this.tileType === TileType.WHEAT) {
            return [251, 221 + Math.random() * 15, 126 + Math.random() * 15];
        }
        if (this.tileType === TileType.BRICK) {
            return [170 + Math.random()*15, 74 + Math.random()*3, 68 + Math.random()*3];
        }
        if (this.tileType === TileType.WOOD) {
            return [1+Math.random()*5, 89 + Math.random()*15, 41 + Math.random()*15];
        }
        if (this.tileType === TileType.WATER) {
            return [0, 0, 200 + Math.random()*30];
        }
        if (this.tileType === TileType.DESERT) {
            return [250+Math.random()*3, 213+Math.random()*5, 165 + Math.random()*5];
        }
        return [0, 0, 0];
    }

    
}
