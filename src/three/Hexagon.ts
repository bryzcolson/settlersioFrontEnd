import * as THREE from 'three';

export class Hexagon {
    centerX: number;

    centerY: number;

    radius: number;

    constructor(centerX: number, centerY: number, radius: number) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
    }


    isPointInside(position:THREE.Vector2):boolean {
        return this.distanceToHexagon(position.x, position.y) > 0;
    }

    /**
     * Calculates the point distance to the edge of the hexagon.
     * @param x The world x coordinate of the point to calculate distance to
     * @param y The world y coorindate of the point to calculate distance to
     */
    distanceToHexagon(x: number, y: number) {
        const SQ3 = Math.sqrt(3);
        // Convert to hexagon coordinates
        const xHex = x - this.centerX;
        const yHex = y - this.centerY;

        // Check outside square of hexagon
        if (xHex * xHex + yHex * yHex > this.radius * this.radius) return 0;

        // Compute which section of hexagon we are in
        // Starting in top left of hexagon as 1 and going clockwise to 6
        let boxNum: number;
        if (yHex > 0) {
            if (yHex <= -1 * SQ3 * xHex) {
                boxNum = 1;
            } else if (yHex < SQ3 * xHex) {
                boxNum = 3;
            } else {
                boxNum = 2;
            }
        } else if (yHex > -1 * SQ3 * xHex) {
            boxNum = 4;
        } else if (yHex > SQ3 * xHex) {
            boxNum = 6;
        } else {
            boxNum = 5;
        }

        // Compute the distance to the side
        let distance: number = 0;
        // eslint-disable-next-line default-case
        switch (boxNum) {
        case 1:
            distance = 0.5 * (SQ3 * xHex - yHex + this.radius * SQ3);
            break;
        case 2:
            distance = (SQ3 * this.radius) / 2 - yHex;
            break;
        case 3:
            distance = 0.5 * (-1 * SQ3 * xHex - yHex + this.radius * SQ3);
            break;
        case 4:
            // multiply by -1 at start so the value is positive when inside the hexagon
            distance = -1 * 0.5 * (SQ3 * xHex - yHex - this.radius * SQ3);
            break;
        case 5:
            distance = yHex + (SQ3 * this.radius) / 2;
            break;
        case 6:
            distance = -1 * 0.5 * (-1 * SQ3 * xHex - yHex - this.radius * SQ3);
            break;
        }
        if (distance < 0) distance = 0;
        return distance;
    }

    clampedDistanceToHexagon(x: number, y: number) {
        let dist = this.distanceToHexagon(x, y);
        if (dist > this.radius * 0.4) dist = this.radius * 0.4;
        return dist;
    }
}
