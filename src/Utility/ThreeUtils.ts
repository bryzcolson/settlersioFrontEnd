import * as THREE from 'three';

/**
 * A collection of utility functions for THREE.js
 */

/**
 * Takes a buffer geometry and colors every single point with a specified rgb value.
 * @param geometry The geometry to color.
 * @param rgb The rgb value to color the geometry with.
 */
export function colorGeometryThree(geometry: THREE.BufferGeometry, rgb: THREE.Color) {
    const rgb255 = getRGB255(rgb);
    return colorGeometry(geometry, rgb255);
}
export function colorGeometry(geometry: THREE.BufferGeometry, rgb255: RGB255) {
    const colors = new Uint8Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) {
        colors[i] = rgb255.r;
        colors[i + 1] = rgb255.g;
        colors[i + 2] = rgb255.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
}


export function clamp(num: number, min: number, max: number) {
    if (num < min) return min;
    if (num > max) return max;
    return num;
}
export class RGB255 {
    r: number;
    g: number;
    b: number;
    // Hack so I can't accidentally pass a THREE.Color as an RGB255.
    _THIS_IS_NOT_A_THREE_JS_COLOR_TYPE: undefined;
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
export function getRGB255(color: THREE.Color): RGB255 {
    const r = clamp(Math.round(color.r * 255), 0, 255);
    const g = clamp(Math.round(color.g * 255), 0, 255);
    const b = clamp(Math.round(color.b * 255), 0, 255);
    return new RGB255(r,g,b);
}
