import {
    PCFSoftShadowMap,
    Scene,
    WebGLRenderer,
} from 'three';
import { Game } from '../state/Game';
import { GameState } from '../state/GameState';


export function ThreeJSCanvas(initialGameState: GameState) {
    const canvas:HTMLCanvasElement  = document.querySelector(`canvas#${"scene"}`)!
    let requestId:number;

    // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    const scene = new Scene();

    // Handle resizing of the window
    const resizeRendererToDisplaySize = (webGLRenderer: WebGLRenderer) => {
        const canvas = webGLRenderer.domElement
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            webGLRenderer.setSize(width, height, false);
        }
        return needResize;
    };

    // Create the actual game state
    const cameraAspectRatio = canvas.clientWidth / canvas.clientHeight;
    const game = new Game(scene, cameraAspectRatio, canvas, initialGameState);

    let lastFrameTime = 0;
    const animate = (timestamp:number) => {
        // Get deltatime
        requestId = requestAnimationFrame(animate);
        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        // Handle resizing the window
        if (resizeRendererToDisplaySize(renderer)) {
            game.adjustCameraAspectRatio(canvas.clientWidth / canvas.clientHeight);
        }

        // Update game state
        game.update(deltaTime, timestamp);

        // Re render the scene
        renderer.render(scene, game.cameraControls.camera);
    };

    animate(0);
}
