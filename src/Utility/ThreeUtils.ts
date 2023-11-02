import * as THREE from 'three';

/**
 * A collection of utility functions for THREE.js
 */

/**
 * Takes a buffer geometry and colors every single point with a specified rgb value.
 * @param geometry The geometry to color.
 * @param rgb The rgb value to color the geometry with.
 */
export function colorGeometry(geometry: THREE.BufferGeometry, rgb: THREE.Color) {
    const colors = new Uint8Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) {
        colors[i] = rgb.r;
        colors[i + 1] = rgb.g;
        colors[i + 2] = rgb.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
}