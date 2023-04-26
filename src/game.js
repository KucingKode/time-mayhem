import Phaser from 'phaser'
import PhaserRaycaster from 'phaser-raycaster'
import MainScene from './scenes/MainScene'
import SetupScene from './scenes/SetupScene'

const game = new Phaser.Game({
	type: Phaser.WEBGL,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 3840,
		height: 2160,
	},
	pixelArt: true,
	input: {
		mouse: true,
	},
	physics: {
		default: 'arcade',
		arcade: {
			// debug: true,
			gravity: { y: 5100 },
		},
	},
	scene: [SetupScene, MainScene],
	plugins: {
		scene: [
			{
				key: 'PhaserRaycaster',
				plugin: PhaserRaycaster,
				mapping: 'raycasterPlugin',
			},
		],
	},
})

export default game
