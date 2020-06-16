class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
	}

	/**
	 * This method draws the actor in the world, or worldActive array.
	 *
	 * @param {*} x - X coordinate of the actor
	 * @param {*} y - Y coordinate of the actor
	 * @memberof Actor
	 */
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
			x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}

	/**
	 *	This method moves the actor in the world, or worldActive array.
	 *
	 * @param {*} dx - X coordinate of the movement. Check getKey()
	 * @param {*} dy - Y coordinate of the movement. Check getKey()
	 * @memberof Actor
	 */
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
}