import Phaser from 'phaser'

class Platform extends Phaser.Physics.Arcade.Image {
	constructor(scene, theme, x, y, config) {
		const texture = `platform/${theme}`
		const [width, height] = config

		super(scene, x + width / 2, y + height / 2, texture)

		scene.add.existing(this)
		scene.physics.add.existing(this, true)

		this.hitted = false
		this.rect = this.scene.add.rectangle(
			this.body.x + this.body.width / 2,
			this.body.y + this.body.offset.y,
			this.body.width,
			this.body.height,
		)

		this.setDisplaySize(width, height).setPipeline('Light2D')
		this.body.setSize(width, height / 2).setOffset(0, height / 3.5)
		this.rect.objectType = 'PLATFORM'
		this.rect.hit = () => this.hit()

		this.scene.events.on('update', this.update, this)
	}

	update() {
		this.clearTint()
	}

	kill() {
		this.scene.platformGroup.remove(this)
		this.destroy(true)
	}

	hit() {
		this.setTintFill(0xffffff)
	}
}

export default Platform
