import "@esotericsoftware/spine-pixi-v7";
import "./style.css";
import { Spine } from "@esotericsoftware/spine-pixi-v7";
import type { Animation } from "@esotericsoftware/spine-core";
import { Application, Assets } from "pixi.js";

let currentSpine: Spine | null = null;
let currentAnimation = "";
let currentSkin = "";

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

const app = new Application<HTMLCanvasElement>({
    backgroundColor: 0xd3d3d3,
    width: gameWidth,
    height: gameHeight,
});

window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);

    resizeCanvas();

    const spineExample = await getSpine();
    currentSpine = spineExample;

    app.stage.addChild(spineExample);
    app.stage.interactive = true;

    // Create control group container
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';

    // Create skin control group
    const skinControl = document.createElement('div');
    skinControl.className = 'control-item';

    const skinLabel = document.createElement('label');
    skinLabel.className = 'control-label';
    skinLabel.textContent = 'Skin';

    // Create skin select
    const skinSelect = document.createElement('select');
    skinSelect.className = 'skin-select';

    // Get all skins from spine data
    const skins = spineExample.skeleton.data.skins;
    skins.forEach((skin) => {
        const option = document.createElement('option');
        option.value = skin.name;
        option.textContent = skin.name;
        if (skin.name === currentSkin) {
            option.selected = true;
        }
        skinSelect.appendChild(option);
    });

    skinSelect.onchange = (e) => {
        const select = e.target as HTMLSelectElement;
        currentSkin = select.value;
        if (currentSpine) {
            currentSpine.skeleton.setSkinByName(currentSkin);
            currentSpine.skeleton.setSlotsToSetupPose();
        }
    };

    // Create animation control group
    const animationControl = document.createElement('div');
    animationControl.className = 'control-item';

    const animationLabel = document.createElement('label');
    animationLabel.className = 'control-label';
    animationLabel.textContent = 'Animation';

    // Create animation select
    const animationSelect = document.createElement('select');
    animationSelect.className = 'animation-select';

    // Get all animations from spine data
    const animations = spineExample.skeleton.data.animations as Animation[];
    animations.forEach((animation: Animation) => {
        const option = document.createElement('option');
        option.value = animation.name;
        option.textContent = animation.name;
        if (animation.name === currentAnimation) {
            option.selected = true;
        }
        animationSelect.appendChild(option);
    });

    animationSelect.onchange = (e) => {
        const select = e.target as HTMLSelectElement;
        currentAnimation = select.value;
        if (currentSpine) {
            currentSpine.state.setAnimation(0, currentAnimation);
        }
    };

    // Create and add the play button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Animation';
    playButton.className = 'play-button';
    playButton.onclick = () => {
        if (currentSpine) {
            // Reset and play the animation
            currentSpine.state.setAnimation(0, currentAnimation);
        }
    };

    // Add all controls to their respective groups
    skinControl.appendChild(skinLabel);
    skinControl.appendChild(skinSelect);

    animationControl.appendChild(animationLabel);
    animationControl.appendChild(animationSelect);

    // Add all groups to the main control group
    controlGroup.appendChild(skinControl);
    controlGroup.appendChild(animationControl);
    controlGroup.appendChild(playButton);
    document.body.appendChild(controlGroup);
};

async function loadGameAssets(): Promise<void> {
    const manifest = {
        bundles: [
            {
                name: "spine-custom",
                assets: [
                    { alias: "spineData", src: "./assets/spine/bonus.json" },
                    { alias: "spineAtlas", src: "./assets/spine/ft.atlas" }
                ],
            },
        ],
    };

    await Assets.init({ manifest });
    await Assets.loadBundle(["spine-custom"]);
}

function resizeCanvas(): void {
    const resize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.stage.scale.x = window.innerWidth / gameWidth;
        app.stage.scale.y = window.innerHeight / gameHeight;
    };

    resize();

    window.addEventListener("resize", resize);
}

async function getSpine(): Promise<Spine> {
    const spine = Spine.from("spineData", "spineAtlas");
    currentAnimation = spine.skeleton.data.animations[0].name;
    currentSkin = spine.skeleton.data.skins[0].name;
    spine.skeleton.setSkinByName(currentSkin);
    spine.state.setAnimation(0, currentAnimation);

    return spine;
}
