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

    constructor(x: number, y: number, innerRadius: number, outerRadius: number, tileType: TileType) {
        // Initialize variables
        this.innerHexagon = new Hexagon(x, y, innerRadius);
        this.outerHexagon = new Hexagon(x, y, outerRadius);
        this.tileType = tileType;
        this.noiseMap = NoiseFactory.noiseFromTileType(this.tileType, this.innerHexagon);
    }

    /**
     * Computes if a world coordinate lies within the boundaries of this Tile
     * @param x world x coordinate
     * @param y world y coordinate
     */
    doesOwnPoint(x: number, y: number): boolean {
        return this.outerHexagon.distanceToHexagon(x, y) > 0;
    }

    getHeight(x: number, y: number): number {
        return this.noiseMap.getPerlin(x, y);
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
        return [0, 0, 0];
    }
}
