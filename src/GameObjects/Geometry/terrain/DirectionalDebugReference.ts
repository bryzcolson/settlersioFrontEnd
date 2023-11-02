import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { GameObject } from "../../GameObject";

export class DirectionalDebugReference extends GameObject {

    xCube: Mesh;

    yCube: Mesh;
    
    zCube: Mesh;

    constructor() {
        super();
        // Directional reference for debugging - remove later
        const xGeom = new BoxGeometry(3,1,1,1,1);
        xGeom.translate(2,0,0);
        this.xCube = new Mesh(
            xGeom,
            new MeshBasicMaterial({color:0xff0000})
        );
        super.add(this.xCube);
        const yGeom = new BoxGeometry(1,3,1,1,1);
        yGeom.translate(0,2,0);
        this.yCube = new Mesh(
            yGeom,
            new MeshBasicMaterial({color:0x00ff00})
        );
        super.add(this.yCube);
        const zGeom = new BoxGeometry(1,1,3,1,1);
        zGeom.translate(0,0,2);
        this.zCube = new Mesh(
            zGeom,
            new MeshBasicMaterial({color:0x0000ff})
        );
        super.add(this.zCube);
    }
    
}