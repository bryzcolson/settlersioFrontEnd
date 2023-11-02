import * as THREE from 'three';
import { GameObject } from '../../GameObject';

const OCEAN_WIDTH = 1000;
const OCEAN_HEIGHT = OCEAN_WIDTH;
const ANIMATION_SCALE = 100;

const vertShader = `
uniform float uTime;
attribute vec3 in_Position;
varying vec2 fragCoord;
varying vec2 vUv; 
void main() {
    vec3 pos = position;
    //pos.z += cos(pos.x*5.0+uTime) * 0.1 * sin(pos.y * 5.0 + uTime);
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    fragCoord = pos.xy;
}
`;
const fragShader = `
#include <packing>

uniform vec3      uPlaneSize;           // Size of the plane in worldspace
uniform vec4 uPlane; // Size of the water plane (x, y, w, h)
uniform float     uTime;                 // shader playback time (in seconds)
uniform sampler2D texture1;               // Water texture

varying vec2 fragCoord;

void main(){
    vec2 PlaneUV; // UV coords on the water plane (0 to 1). Anything higher will wrap around.
    PlaneUV.x = fragCoord.x / uPlaneSize.x;
    PlaneUV.y = fragCoord.y / uPlaneSize.y;

    float Scale = 0.2;
    float s0 =  6.9*Scale;
    float s1 = 10.1*Scale;
    float s2 =  8.5*Scale;
    float s3 =  7.7*Scale;

    float TimeScale = 0.000018;
    float time = uTime;
    float t0 =  6.9*time*Scale*TimeScale;
    float t1 = 10.1*time*Scale*TimeScale;
    float t2 =  8.5*time*Scale*TimeScale;
    float t3 =  7.7*time*Scale*TimeScale;

    float TexSample0 = texture(texture1, vec2( PlaneUV.x*s0+t0,  PlaneUV.y*s0+t0)).r;
    float TexSample1 = texture(texture1, vec2(-PlaneUV.x*s1+t1, -PlaneUV.y*s1+t1)).g;
    float TexSample2 = texture(texture1, vec2(-PlaneUV.x*s2+t2,  PlaneUV.y*s2+t2)).b;
    float TexSample3 = texture(texture1, vec2( PlaneUV.x*s3+t3, -PlaneUV.y*s3+t3)).g;

    float Water = (TexSample0 + TexSample1 + TexSample2 + TexSample3) * 0.333;
    Water = Water * Water * Water;

    Water = Water < 0.09 || Water > 0.5 ? Water : 0.0;
    Water = Water > 0.5 ? 1.0 : Water;

    vec3 color = vec3(0.0,0.7,1.0) + vec3(Water);
    //vec3 color = vec3(Water);
    gl_FragColor = vec4(color, 0.8);
}
`;

export class OceanWater extends GameObject {
    waterMesh: THREE.Mesh;

    constructor(y: number) {
        super();
        // First, create the water plane geometry
        const waterGeometry = new THREE.PlaneGeometry(OCEAN_WIDTH, OCEAN_WIDTH, 1, 1);

        const texture = new THREE.TextureLoader().load( 'images/waterTexture.png' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        const uniforms = {
            uTime: { value: 0.0 },
            texture1: {value: texture},
            uPlaneSize: {value: new THREE.Vector2(ANIMATION_SCALE, ANIMATION_SCALE)},
        };

        // Create custom shader material
        const waterMaterial = new THREE.ShaderMaterial( {
            uniforms,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent:true,
        } );

        // Create the water mesh with the geometry and material
        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);

        // Set the rotation of the water mesh to face up
        waterMesh.rotation.x = -Math.PI / 2;
        waterMesh.position.y = y;

        this.waterMesh = waterMesh;
        super.add(waterMesh);
    }

    override update(deltaTime: number): void {
        let shaderMaterial: THREE.ShaderMaterial = this.waterMesh.material as THREE.ShaderMaterial;
        shaderMaterial.uniforms.uTime.value += deltaTime;
    }

}

function makeOceanFloorMesh(y:number) {
    const oceanFloor = new THREE.PlaneGeometry(OCEAN_WIDTH, OCEAN_HEIGHT, 1, 1);

    const mat = new THREE.MeshStandardMaterial({
        color: 0xeed4ad
    });

    const mesh = new THREE.Mesh(oceanFloor, mat);
    mesh.rotation.x = -Math.PI /2;
    mesh.position.y = y;

    return mesh;
}

export class OceanFloor extends GameObject {
    oceanMesh: THREE.Mesh;
    constructor(y: number) {
        super();
        this.oceanMesh = makeOceanFloorMesh(y);
        super.add(this.oceanMesh);
    }
}