import React, { useEffect, useRef } from 'react';
import {
    AmbientLight,
    Clock,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PointLight,
    Scene,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { TileType } from '../three/Tile';
import { makeTreesMesh } from '../three/TreeGeometry';
import { World } from '../three/World';

export function ThreeJSCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
        const renderer = new WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        const scene = new Scene();

        // ===== 💡 LIGHTS =====
        const ambientLight = new AmbientLight('white', 0.4);
        const pointLight = new PointLight('#ffdca8', 1.2, 100);
        pointLight.position.set(5, 15, 12);
        pointLight.castShadow = true;
        pointLight.shadow.radius = 4;
        pointLight.shadow.camera.near = 0.5;
        pointLight.shadow.camera.far = 4000;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        scene.add(ambientLight);
        scene.add(pointLight);

        // ===== 📦 OBJECTS =====
        const tileGridWidth = 6;
        const tileGridHeight = 6;
        const tileTypes: TileType[][] = [];
        for (let i = 0; i < tileGridWidth; i++) {
            tileTypes.push([]);
            for (let j = 0; j < tileGridHeight; j++) {
                const typeNum = Math.floor(Math.random() * 6);
                let tileType: TileType;
                if (typeNum === 0) {
                    tileType = TileType.STONE;
                } else if (typeNum === 1) {
                    tileType = TileType.SHEEP;
                } else if (typeNum === 2) {
                    tileType = TileType.WHEAT;
                } else if (typeNum === 3) {
                    tileType = TileType.WOOD;
                } else if (typeNum === 4) {
                    tileType = TileType.BRICK;
                } else if (typeNum === 5) {
                    tileType = TileType.DESERT;
                } else {
                    tileType = TileType.WATER;
                }
                tileTypes[i].push(tileType);
            }
        }
        const hexagonWorldRadius = 3;
        const world = new World(hexagonWorldRadius, 6, 5, tileTypes);
        const terrain = world.getTerrain();
        scene.add(terrain);

        const trees = makeTreesMesh(world.tiles);
        scene.add(trees);

        // ===== 🎥 CAMERA =====
        let canvas: HTMLCanvasElement = canvasRef.current!;
        const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(0, 25, 25);

        // ===== 🕹️ CONTROLS =====
        const cameraControls = new OrbitControls(camera, renderer.domElement);
        const cameraTarget = terrain.position.clone();
        // Temporary approximation for testing
        cameraTarget.x += tileGridWidth*hexagonWorldRadius*0.75;
        cameraTarget.z -= tileGridHeight*hexagonWorldRadius;
        cameraControls.target = cameraTarget;
        cameraControls.enableDamping = true;
        cameraControls.autoRotate = false;
        cameraControls.update();

        // ===== 📈 STATS & CLOCK =====
        new Clock();
        const stats = Stats();
        document.body.appendChild(stats.dom);

        const resizeRendererToDisplaySize = (webGLRenderer: WebGLRenderer) => {
            canvas = canvasRef.current!;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                webGLRenderer.setSize(width, height, false);
            }
            return needResize;
        };

        const animate = () => {
            requestAnimationFrame(animate);

            stats.update();

            if (resizeRendererToDisplaySize(renderer)) {
                canvas = canvasRef.current!;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            cameraControls.update();

            renderer.render(scene, camera);
        };

        animate();

        return (): void => {
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return <canvas ref={canvasRef} />;
}
