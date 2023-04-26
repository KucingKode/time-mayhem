import Phaser from 'phaser'
import { SCALE } from '../gameConst'

export const POWERUP_WIDTH = 122 * SCALE
export const POWERUP_HEIGHT = 220 * SCALE
const POWERUP_LIGHT_RADIUS = 500 * SCALE

class Powerup extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'powerup')

		this.scene.add.existing(this)
		this.scene.physics.add.existing(this)

		this.light = this.scene.lights.addLight(x, y, POWERUP_LIGHT_RADIUS)
		this.particle = this.scene.add.particles(
			x,
			y,
			new Phaser.Geom.Rectangle(0, 0, 100, 100),
			{
				scale: { start: 1, end: 0 },
				speedX: { max: 200, min: -200 },
				speedY: { max: -50, min: -300 },
				frequency: 20,
				lifespan: 1000,
				tint: 0xff5ea1,
				tintFill: true,
			},
		)

		this.setDisplaySize(POWERUP_WIDTH, POWERUP_HEIGHT)
		this.setPipeline('Light2D')
		this.play({
			key: 'powerupAnim',
			repeat: -1,
			frameRate: 8,
		})

		this.scene.events.on('update', this.update, this)
	}

	update() {
		this.light.x = this.x
		this.light.y = this.y
		this.particle.x = this.x
		this.particle.y = this.y
	}

	kill() {
		this.scene.sound.play('powerup')
		this.scene.powerupGroup.remove(this)
		this.scene.events.off('update', this.update, this)
		this.scene.lights.removeLight(this.light)
		this.particle.destroy(true)
		this.destroy(true)
	}
}

export default Powerup
