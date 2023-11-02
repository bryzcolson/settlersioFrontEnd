import { TileType } from './Tile';
import { Hexagon } from './Hexagon';
import { Noise } from './Noise';

export class NoiseFactory {
    static noiseFromTileType(type: TileType, hexagon: Hexagon): Noise {
        const x = hexagon.centerX - hexagon.radius;
        const y = hexagon.centerY - (hexagon.radius * Math.sqrt(3)) / 2;
        let noise: Noise;
        switch (type) {
        case TileType.STONE:
            noise = new Noise(10, x, y, hexagon.radius * 2, hexagon, 1.8);
            return noise;
        case TileType.SHEEP:
            noise = new Noise(5, x, y, hexagon.radius * 2, hexagon, 0.25);
            return noise;
        case TileType.DESERT:
            noise = new Noise(10, x, y, hexagon.radius * 2, hexagon, 0.1);
            return noise;
        case TileType.WHEAT:
            noise = new Noise(10, x, y, hexagon.radius * 2, hexagon, 0);
            return noise;
        default:
            noise = new Noise(1, x, y, hexagon.radius * 2, hexagon, 0);
            return noise;
        }
    }
}
