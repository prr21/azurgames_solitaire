import Phaser from 'phaser';
import {MainScene} from './scene';

const config = {
    version: "1.1",
    type: Phaser.CANVAS,
    parent: 'phaser-solitaire',  
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 1920,
    },
    scene: MainScene
};

export async function start() {
    const game = new Phaser.Game(config);
    await new Promise((r)=>game.events.once("ready", r));
}
