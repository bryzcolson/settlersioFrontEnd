class Hexagon {
    centerX:number;
    centerY:number;
    radius:number;

    constructor(centerX:number, centerY:number, radius:number) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius
    }

    /*distanceArray(size:number) {
        let SQ3 = Math.sqrt(3);
        let arr:number[] = [];
        
        let count = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                //let x = this.width * (i / size);
                //let y = this.height * (j / size);
                let x = this.width*(i/(size-1) - 0.5);
                let y = this.height*(j/(size-1) - 0.5);
                console.log("X:" + x + " Y:" + y + " i:" + i + " j:" + j);

                let distance = x*x+y*y;
                //let distance = count;
                //let distance = i+j;
                arr[count] = distance/5;
                count++;
            }
        }
        return arr;
    }*/

    /**
     * Calculates the point distance to the edge of the hexagon.
     * @param x The world x coordinate of the point to calculate distance to
     * @param y The world y coorindate of the point to calculate distance to
     */
    distanceToHexagon(x:number, y:number) {
        const SQ3 = Math.sqrt(3);
        // Convert to hexagon coordinates
        x = x - this.centerX;
        y = y - this.centerY;

        // Check outside square of hexagon
        if (x*x + y*y > this.radius*this.radius) return 0;


        // Compute which section of hexagon we are in
        // Starting in top left of hexagon as 1 and going clockwise to 6
        let boxNum:number;
        if (y > 0) {
            if (y <= -1*SQ3*x) {
                boxNum = 1;
            }
            else if (y < SQ3*x) {
                boxNum = 3;
            }
            else {
                boxNum = 2;
            }
        }
        else {
            if (y > -1 * SQ3*x) {
                boxNum = 4;
            }
            else if (y > SQ3*x) {
                boxNum = 6;
            }
            else {
                boxNum = 5;
            }
        }

        // Compute the distance to the side
        let distance:number = 0;
        //x = Math.abs(x);
        //y = Math.abs(y);
        switch(boxNum) {
            case 1:
                distance = 0.5* (SQ3*x - y + this.radius*SQ3);
                break;
            case 2:
                distance = SQ3*this.radius/2 - y;
                break;
            case 3:
                distance = 0.5* (-1*SQ3*x - y + this.radius*SQ3);
                break;
            case 4:
                // multiply by -1 at start so the value is positive when inside the hexagon
                distance = -1*0.5* (SQ3*x - y - this.radius*SQ3);
                break;
            case 5:
                distance = y + SQ3*this.radius/2;
                break;
            case 6:
                distance = -1*0.5* (-1*SQ3*x - y - this.radius*SQ3);
                break;
        }
        if (distance < 0) distance = 0;
        //console.log("X: " + x + " Y:" +y + " D: " + distance);
        return distance;
    }

    clampedDistanceToHexagon(x:number, y:number) {
        let dist = this.distanceToHexagon(x,y);
        if (dist > this.radius*0.4) dist = this.radius*0.4;
        return dist;
    }

    /**distanceArray(size:number) {
        let SQ3 = Math.sqrt(3);
        let arr:number[] = [];
        
        let count = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let x = this.boxWidth*(i/(size-1) - 0.5);
                let y = this.boxHeight*(j/(size-1) - 0.5);
                let distance = this.distanceToHexagon(x,y);
                arr[count] = distance;
                console.log("X: " + x + " Y: " + y + " d: " + distance);
                count++;
            }
        }
        return arr;
    }**/


}

export {Hexagon};