import {Hexagon} from "./hexagonDistance";


class Noise {

    hexagon:Hexagon;
    width:number;
    worldX:number;
    worldY:number;

    noise:number[];
    noiseDensity:number;
    constructor(noiseDensity: number, worldX:number, worldY:number, width:number, hexagon:Hexagon) {
        this.worldX = worldX;
        this.worldY = worldY;
        this.width = width;

        this.noiseDensity = noiseDensity;
        this.noise = new Array(noiseDensity*noiseDensity).fill(0);
        this.hexagon = hexagon;
        this.generateBasicNoise();
    }

    generateBasicNoise(){
        for (let i = 0; i < this.noiseDensity; i++) {
            for (let j = 0; j < this.noiseDensity; j++) {
                let x = (i / (this.noiseDensity-1))*this.width + this.worldX;
                let y = (j / (this.noiseDensity-1))*this.width + this.worldY;

                // Initialize with random noise that gets smaller at edges of hexagon
                this.noise[j*this.noiseDensity + i] = Math.random() * this.hexagon.distanceToHexagon(x,y);
            }
        }
    }

    /**
     * Gets the interpolated nosie given a world x and y position
     * @param x the world x position to interpolate noise at
     * @param y the world y position to interpolate noise at
     */
    getNoise(x:number, y:number):number {
        // Make sure in our bounds
        if (x < this.worldX || x > this.worldX + this.width) return 0;
        if (y < this.worldY || y > this.worldY + this.width) return 0;

        // Convert to i and j position in our noise array (will be decimals)
        let i = ((x - this.worldX) / this.width) * (this.noiseDensity - 1);
        let j = ((y - this.worldY) / this.width) * (this.noiseDensity - 1);

        if (i < 0 || i > this.noiseDensity || j < 0 || j > this.noiseDensity) {
            // Should not happen
            console.warn("Computing i and j for noise density returned out of bounds. X: " + x + "Y: " + y +
                " worldX: " + this.worldX + " worldY: " + this.worldY + " width: " + this.width);
        }

        // Get integer lower and upper indicies
        let i1 = Math.floor(i);
        let i2 = Math.ceil(i);
        let j1 = Math.floor(j);
        let j2 = Math.ceil(j);

        // --- Bilinear interpolation ---
        // Interpolate on the x axis
        let xT = i / (i2-i1);
        let yT = j / (j2-j1);
        return this.bilinearInterpolation(this.getIndexNoise(i1, j1), this.getIndexNoise(i2, j1),
            this.getIndexNoise(i1, j2), this.getIndexNoise(i2,j2), xT,yT);
    }

    getIndexNoise(i:number, j:number) {
        return this.noise[j*this.noiseDensity + i];
    }

    lerp(a:number,b:number,i:number):number {
        return i*(b-a) + a;
    }

    /**
     * Bilinear interpolation
     * @param upperLeft The value at the top left point
     * @param upperRight top right value
     * @param bottomLeft bottom left value
     * @param bottomRight bottom right value
     * @param xT percentage to interpolate between the x's
     * @param yT percentage to interpolate between the y's
     */
    bilinearInterpolation(upperLeft:number, upperRight:number, bottomLeft:number, bottomRight:number, xT:number, yT:number) {
        let noiseUpper = this.lerp(upperLeft, upperRight, xT);
        let noiseLower = this.lerp(bottomLeft, bottomRight, xT);

        return this.lerp(noiseUpper, noiseLower, yT);
    }



}

export {Noise};