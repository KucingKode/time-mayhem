import Phaser from 'phaser'

export default class SetupScene extends Phaser.Scene {
	constructor() {
		super('setup')
	}

	preload() {
		this.load.spritesheet('powerup', 'assets/powerup.png', {
			frameWidth: 487,
			frameHeight: 881,
		})
		this.load.spritesheet('player', 'assets/player.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('bomb', 'assets/bomb.png', {
			frameWidth: 474,
			frameHeight: 219,
		})
	}

	create() {
		this.anims.create({
			key: 'powerupAnim',
			frames: this.anims.generateFrameNumbers('powerup'),
			frameRate: 10,
			repeat: -1,
		})

		this.anims.create({
			key: 'bombAnim',
			frames: this.anims.generateFrameNumbers('bomb'),
			frameRate: 10,
			repeat: -1,
		})

		this.anims.create({
			key: 'playerIdle',
			frames: this.anims.generateFrameNumbers('player', {
				start: 0,
				end: 14,
			}),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'playerWalk',
			frames: this.anims.generateFrameNumbers('player', {
				start: 15,
				end: 29,
			}),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'playerShoot',
			frames: this.anims.generateFrameNumbers('player', {
				start: 30,
				end: 37,
			}),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'playerDeath',
			frames: this.anims.generateFrameNumbers('player', {
				start: 45,
				end: 59,
			}),
			frameRate: 10,
			repeat: -1,
		})

    this.scene.start('main')
	}
}
