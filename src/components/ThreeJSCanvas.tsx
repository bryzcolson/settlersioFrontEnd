import React, { useEffect, useRef } from 'react';
import {
    AmbientLight, Clock,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PointLight,
    Scene,
    WebGLRenderer
} from "three";
import {TileType} from "../three/Tile";
import {RWorld} from "../three/RefactoredWorld";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export const ThreeJSCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
        let renderer = new WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        let scene = new Scene();

        // ===== 💡 LIGHTS =====
        let ambientLight = new AmbientLight('white', 0.4);
        let pointLight = new PointLight('#ffdca8', 1.2, 100);
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
        let tileGridWidth = 6;
        let tileGridHeight = 6;
        let tileTypes: TileType[][] = [];
        for (let i = 0; i < tileGridWidth; i++) {
            tileTypes.push([]);
            for (let j = 0; j < tileGridHeight; j++) {
                let typeNum = Math.floor(Math.random()*4);
                let tileType: TileType;
                //typeNum = 1;
                if (typeNum === 0 || typeNum === 4) {
                    tileType = TileType.STONE;
                } else if (typeNum === 1) {
                    tileType = TileType.SHEEP;
                } else if (typeNum === 2) {
                    tileType = TileType.WHEAT;
                } else {
                    tileType = TileType.STONE;
                }
                tileTypes[i].push(tileType);
            }
        }
        let world = new RWorld(3,6,5,tileTypes).getTerrain();
        scene.add(world);

        // ===== 🎥 CAMERA =====
        let canvas: HTMLCanvasElement = canvasRef.current!;
        let camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(0, 25, 25);

        // ===== 🕹️ CONTROLS =====
        let cameraControls = new OrbitControls(camera, renderer.domElement);
        cameraControls.target = world.position.clone();
        cameraControls.enableDamping = true;
        cameraControls.autoRotate = false;
        cameraControls.update();

        // ===== 📈 STATS & CLOCK =====
        new Clock();
        let stats = Stats();
        document.body.appendChild(stats.dom);

        const animate = function () {
            requestAnimationFrame(animate);

            stats.update();

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas: HTMLCanvasElement = canvasRef.current!;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            cameraControls.update();

            renderer.render(scene, camera);
        };

        const resizeRendererToDisplaySize = (renderer: WebGLRenderer) => {
            const canvas: HTMLCanvasElement = canvasRef.current!;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        animate();

        return (): void => {
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <canvas ref={canvasRef}/>
    );
};