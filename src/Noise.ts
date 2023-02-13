import {Hexagon} from "./Hexagon";
import { TileType } from "./Tile";


class Noise {

    hexagon:Hexagon;
    width:number;
    worldX:number;
    worldY:number;
    scaleFactor:number;

    noise:number[];
    perlinNoise: Array<Array<number>>;
    noiseDensity:number;
    constructor(noiseDensity: number, worldX:number, worldY:number, width:number, hexagon:Hexagon, scaleFactor:number) {
        this.worldX = worldX;
        this.worldY = worldY;
        this.width = width;
        this.scaleFactor = scaleFactor;

        this.noiseDensity = noiseDensity;
        this.noise = new Array(noiseDensity*noiseDensity).fill(0);
        this.perlinNoise = new Array(noiseDensity*noiseDensity).fill([]);
        this.hexagon = hexagon;
        this.generateBasicNoise();
        this.generateGradient();
    }

    //--------------------------
    generateGradient() {
        for (let i = 0; i < this.noiseDensity; i++) {
            for (let j = 0; j < this.noiseDensity; j++) {
                //let x = (i / (this.noiseDensity-1))*this.width + this.worldX;
                //let y = (j / (this.noiseDensity-1))*this.width + this.worldY;

                let gradient = [Math.random(), Math.random()];
                let norm = gradient[0]*gradient[0] + gradient[1]*gradient[1];
                norm = Math.sqrt(norm);
                this.perlinNoise[j*this.noiseDensity + i] = [gradient[0] / norm, gradient[1] / norm];
            }
        }
    }
    /**
     * 
     * @param i i value for array
     * @param j j value for array
     * @param x x coordinate in ij space (not world coordinates)
     * @param y y coordinate in ij space (not world coordiinates)
     */
    dotProduct(i:number, j:number, x:number, y:number):number {
        let v1 = this.perlinNoise[j*this.noiseDensity + i];

        let dx = x - (v1[0]+i);
        let dy = y - (v1[1]+j);

        return (dx*v1[0] + dy*v1[1]);
    }
    getPerlin(x:number,y:number):number {
        // Make sure in our bounds
        if (x <= this.worldX || x >= this.worldX + this.width) return 0;
        if (y <= this.worldY || y >= this.worldY + this.width) return 0;

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
        if (j*this.noiseDensity + i >= this.perlinNoise.length) {
            console.log("BAD");
            return 0;
        }

        // --- Bilinear interpolation ---
        // Interpolate on the x axis
        let xT = i - i1;
        let yT = j - j1;

        let n0 = this.dotProduct(i1, j1, i,j);
        let n1 = this.dotProduct(i2, j1, i, j);
        let ix0 = this.lerp(n0, n1, xT);

        n0 = this.dotProduct(i2, j1, i,j);
        n1 = this.dotProduct(i2,j2, i,j);
        let ix1 = this.lerp(n0,n1, xT);

        return 2*(this.lerp(ix0,ix1,yT)+2)*this.hexagon.distanceToHexagon(x,y) * this.scaleFactor / this.hexagon.radius;

    }
    //--------------------------

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
        let xT = i - i1;
        let yT = j - j1;
        return this.bilinearInterpolation(this.getIndexNoise(i1, j1), this.getIndexNoise(i2, j1),
            this.getIndexNoise(i1, j2), this.getIndexNoise(i2,j2), xT,yT);
    }

    getIndexNoise(i:number, j:number) {
        return this.noise[j*this.noiseDensity + i];
    }

    lerp(a:number,b:number,t:number):number {
        t = this.fade(t);
        return t*(b-a) + a;
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

    fade(t:number) {
        // 6t^5 - 15t^4 + 10t^3
        return (6*t*t - 15*t + 10)*t*t*t;
    }



}

class NoiseFactory {
    static noiseFromTileType(type:TileType, hexagon:Hexagon):Noise {
        let x = hexagon.centerX - hexagon.radius;
        let y = hexagon.centerY - hexagon.radius*Math.sqrt(3)/2;
        let noise:Noise;
        switch(type) {
            case TileType.STONE:
                noise = new Noise(10, x,y, hexagon.radius*2, hexagon, 1.8);
                return noise;
            case TileType.SHEEP:
                noise = new Noise(5, x,y, hexagon.radius*2, hexagon, 0.25);
                return noise;
            case TileType.DESERT:
                noise = new Noise(10,x,y, hexagon.radius*2, hexagon, 0.1);
            case TileType.WHEAT:
            default:
                noise = new Noise(1, x,y, hexagon.radius*2, hexagon, 0);
                return noise;
        }
    }

}

export {Noise, NoiseFactory};