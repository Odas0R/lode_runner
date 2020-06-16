/**
 *
 *
 * @class ActiveActor
 * @extends {Actor}
 */
class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.isFalling = false;
	}

	/**
	 * Draws the active actor that calls this function
	 *
	 * @memberof ActiveActor
	 */
	show() {
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}

	/**
	 * Hides the active actor that calls this function
	 *
	 * @memberof ActiveActor
	 */
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}

	/**
	 *	Moves the active actor according to the dx and dy
	 *
	 * @param {*} dx - how many positions to move on x axis
	 * @param {*} dy - how many positions to move on y axis
	 * @memberof ActiveActor
	 */
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}

	/**
	 * Sets the active actor image to the image
	 * given on the parameter
	 *
	 * @param {*} image - new image to be set on active actor
	 * @memberof ActiveActor
	 */
	setImage(image) {
		this.imageName = image;
		this.draw(this.x, this.y);
	}

	/**
	 * Makes the active actor fall one block on y axis
	 *
	 * @memberof ActiveActor
	 */
	fallDown() {
		setTimeout(() => {
			this.hide();
			this.y = this.y + 1;
			this.show();
		}, 100)
	}


	/**
	 * This method represents the possibility of
	 * an ActiveActor being able to fall.
	 *
	 * @returns true: if all verifications checks if an
	 * 								actor can fall
	 * @memberof ActiveActor
	 */
	canFallDown() {
		let { world } = control;
		let worldItem = world[this.x][this.y];
		let worldItemBelow = world[this.x][this.y + 1];
		return ((worldItem instanceof PassiveActorGravity && worldItemBelow instanceof PassiveActorGravity) ||
			(worldItem instanceof PassiveActorGravity && worldItemBelow instanceof PassiveActorHorizontal) ||
			(worldItemBelow instanceof PassiveActorCatchable && worldItem instanceof PassiveActorGravity));
	}

	/**
	 * This method represents the possibility of
	 * an ActiveActor being able to catch a passive actor.
	 * 
	 * @returns true: if the passive actor the active actor is on can be catch
	 * @memberof ActiveActor
	 */
	canCatch() {
		let { world } = control;
		let worldItem = world[this.x][this.y];
		return worldItem instanceof PassiveActorCatchable;
	}

	/**
	 * Checks if the active actor can move left
	 *
	 * @returns true: if the active actor can move left
	 * @memberof ActiveActor
	 */
	canMoveLeft() {
		let { world } = control;
		if (this.x === 0) return false;
		let worldItem = world[this.x - 1][this.y];
		return worldItem instanceof PassiveActorSolid === false;
	}

	/**
	 * Checks if the active actor can move right
	 *
	 * @returns true: if the active actor can move right
	 * @memberof ActiveActor
	 */
	canMoveRight() {
		let { world } = control;
		if (this.x === WORLD_WIDTH - 1) return false;
		let worldItem = world[this.x + 1][this.y];
		return worldItem instanceof PassiveActorSolid === false;
	}

	/**
	 * Checks if the active actor can move down
	 *
	 * @returns true: if the active actor can move down
	 * @memberof ActiveActor
	 */
	canMoveDown() {
		let { world } = control;
		let worldItemBelow = world[this.x][this.y + 1];
		if (this.y === 15) return false;
		return worldItemBelow instanceof PassiveActorSolid === false;

	}

	/**
	 * Checks if the active actor can move up
	 *
	 * @returns true: if the active actor can move up
	 * @memberof ActiveActor
	 */
	canMoveUp() {
		let { world } = control;
		if (this.y === 0) return false;
		let worldItem = world[this.x][this.y];
		let worldItemUp = world[this.x][this.y - 1];
		if (this.isOnPassiveActorVertical() && worldItemUp instanceof PassiveActorSolid)
			return false;
		return worldItem instanceof PassiveActorVertical;
	}

	/**
	 * Checks if the actor active is on a 
	 * actor passive of type PassiveActorHorizontal
	 *
	 * @returns true: if actor active is on type PassiveActorHorizontal
	 * @memberof ActiveActor
	 */
	isOnPassiveActorHorizontal() {
		let { world } = control;
		let worldItem = world[this.x][this.y];
		return worldItem instanceof PassiveActorHorizontal;
	}

	/**
	 * Checks if the actor active is on a 
	 * actor passive of type PassiveActorVertical
	 *
	 * @returns true: if actor active is on type PassiveActorVertical
	 * @memberof ActiveActor
	 */
	isOnPassiveActorVertical() {
		let { world } = control;
		let worldItem = world[this.x][this.y];
		return worldItem instanceof PassiveActorVertical;
	}

	/**
	 * Checks if the actor active has under him an 
	 * actor passive of type PassiveActorVertical
	 *
	 * @returns true: if actor active is on type PassiveActorVertical
	 * @memberof ActiveActor
	 */
	isOnPassiveActorVerticalBelow() {
		let { world } = control;
		let worldItemBelow = world[this.x][this.y + 1];
		return worldItemBelow instanceof PassiveActorVertical;
	}


	/**
	 * checks if the actor passive on the right of the
	 * actor active is breakable
	 *
	 * @returns true: if object on right is breakable
	 * @memberof ActiveActor
	 */
	canBreakBrickRight() {
		let { world } = control;
		if (this.x === WORLD_WIDTH - 1 &&
			(this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_SHOOTS_RIGHT)) {
			return false;
		}
		let worldItemRight = world[this.x + 1][this.y + 1];
		let worldItemAboveRight = world[this.x + 1][this.y];
		return (worldItemRight instanceof PassiveActorSolidBreackable &&
			(this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_SHOOTS_RIGHT) &&
			(worldItemAboveRight instanceof PassiveActorGravity || worldItemAboveRight instanceof PassiveActorCatchable));
	}

	/**
	 * checks if the actor passive on the left of the
	 * actor active is breakable
	 *
	 * @returns true: if object on left is breakable
	 * @memberof ActiveActor
	 */
	canBreakBrickLeft() {
		let { world } = control;
		if (this.x === 0 &&
			(this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_SHOOTS_LEFT)) {
			return false;
		}
		let worldItemLeft = world[this.x - 1][this.y + 1];
		let worldItemAboveLeft = world[this.x - 1][this.y];
		return (worldItemLeft instanceof PassiveActorSolidBreackable &&
			(this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_SHOOTS_LEFT) &&
			(worldItemAboveLeft instanceof PassiveActorGravity || worldItemAboveLeft instanceof PassiveActorCatchable));
	}

	/**
	 * Checks if the actor active has recoil
	 * when shooting to the right
	 *
	 * @returns true: if actor active can have recoil
	 * @memberof ActiveActor
	 */
	hasRecoilWhenShootRight() {
		let { world } = control;
		if (this.x === 0 &&
			(this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_SHOOTS_RIGHT || this.imageName === HERO_SHOOTS_LEFT)) {
			return false;
		}
		let worldItemBehind = world[this.x - 1][this.y];
		let worldItemBelowRecoil = world[this.x - 1][this.y + 1];
		return !(worldItemBehind instanceof PassiveActorSolid) && !(worldItemBelowRecoil instanceof PassiveActorGravity);
	}

	/**
	 * Checks if the actor active has recoil
	 * when shooting to the left
	 *
	 * @returns true: if actor active can have recoil
	 * @memberof ActiveActor
	 */
	hasRecoilWhenShootLeft() {
		let { world } = control;
		if (this.x === WORLD_WIDTH - 1 && (this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_SHOOTS_LEFT)) {
			return false;
		}
		let worldItemBehind = world[this.x + 1][this.y];
		let worldItemBelowRecoil = world[this.x + 1][this.y + 1];
		return !(worldItemBehind instanceof PassiveActorSolid) && !(worldItemBelowRecoil instanceof PassiveActorGravity);
	}

	/**
	 * Checks if the actor active can shoot to the right without recoil
	 * because on his back is an actor passive of type PassiveActorSolid
	 *
	 * @returns true: if actor active can have recoil
	 * @memberof ActiveActor
	 */
	shootsWithoutRecoilRight() {
		let { world } = control;
		if (this.x === 0 &&
			(this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_SHOOTS_RIGHT)) {
			return true;
		}
		let worldItemBehind = world[this.x - 1][this.y];
		return (worldItemBehind instanceof PassiveActorSolid || this.x === 0);
	}

	/**
	 * Checks if the actor active can shoot to the left without recoil
	 * because on his back is an actor passive of type PassiveActorSolid
	 *
	 * @returns true: if actor active can have recoil
	 * @memberof ActiveActor
	 */
	shootsWithoutRecoilLeft() {
		let { world } = control;
		if (this.x === WORLD_WIDTH - 1 &&
			(this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_SHOOTS_LEFT)) {
			return true;
		}
		let worldItemBehind = world[this.x + 1][this.y];
		return (worldItemBehind instanceof PassiveActorSolid || this.x === WORLD_WIDTH - 1);
	}


	/**
	 * When a level is lost, takes one live of the hero
	 * and load same level
	 *
	 * @returns when hero has no more lives, and gameover
	 * display is run
	 * @memberof ActiveActor
	 */
	decreaseLivesAndLoadlevel() {
		// Decrease total lives
		control.lostLevel = true;
		control.totalLives = control.totalLives - 1;
		updateVisualMenNumber(control.totalLives);
		if (control.totalLives === 0) {
			gameOverDisplay();
			return;
		}
		// reset previous robots
		loseLevelDisplay();
	}

	/**
	 * Makes the object passive of type PassiveActorVictoryVertical
	 * invisible
	 *
	 * @memberof ActiveActor
	 */
	makeVictoryVerticalActorsInvisible() {
		let { passiveVictoryVerticalActors } = control.state;
		passiveVictoryVerticalActors.map(obj => obj.hide());

	}

	/**
	 * Checks if active actor is at a certain distance
	 * from the actual Active Actor position
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns true: if has ActiveActorEvil is at position this.x + x, this.y + y
	 * @memberof ActiveActor
	 */
	hasEvilAt(x, y) {
		let { worldActive } = control;
		let worldItem = worldActive[this.x + x][this.y + y];
		return worldItem instanceof ActiveActorEvil;
	}

}

// ===========================================================
// =============== MARKER INTERFACES (CLASSES) =============== 
// ===========================================================
/**
 *	This Class represents an Evil Actor, which can destroy the hero.
 *
 * @class ActiveActorEvil
 * @extends {ActiveActor}
 */
class ActiveActorEvil extends ActiveActor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
	}

	/**
	 * Checks if active actor of type ActiveActorEvil
     * has touched hero
	 *
	 * @returns true: if has touched
	 * @memberof ActiveActorEvil
	 */
	touchedHero() {
		let { x, y } = hero;
		return this.x === x && this.y === y;
	}

	/**
	 * Checks if active actor of type ActiveActorEvil
	 * will be stuck checking if the block below him is
	 * on brokenBricks(save all the blocks that are broken at 
	 * the moment)
	 *
	 * @returns true: if active actor will be stuck
	 * @memberof ActiveActorEvil
	 */
	canEvilBeStuck() {
		let { x, y } = this;
		let { brokenBricks } = control.state;
		for (const brick of brokenBricks) {
			if (brick.x === x && brick.y === y + 1) return true;
		}
		return false;
	}

	/**
	 * Checks if active actor of type ActiveActorEvil
	 * can fall down
	 *
	 * @returns true: if can fall down
	 * @memberof ActiveActorEvil
	 */
	canEvilFallDown() {
		if (this.canFallDown() && !this.hasEvilAt(0, 1)) {
			return true;
		}
		return false;
	}

	/**
	 * Regenerates an Evil Actor before an specific time.
	 *
	 * @param {*} time - Duration of regeneration
	 * @memberof ActiveActorEvil
	 */
	regenerateEvil(time) {
		let { x, y } = this;
		let brick = getBrickAt(x, y + 1);
		let oldLevel = control.currentLevel;
		setTimeout(() => {
			let { currentLevel, lostLevel, worldActive } = control
			if (oldLevel !== currentLevel || lostLevel) {
				worldActive[x][y] = new Empty();
				return;
			}
			if (!brick.broken && brick.x === x && brick.y === y + 1) {
				this.hide()
				this.y = 0;
				this.show();
				this.isFalling = true;
				this.stuck = false;
				control.totalPoints = control.totalPoints + 100;
				updateVisualScore(control.totalPoints);
				return;
			}

			let dx = this.imageName === ROBOT_FALLS_RIGHT ? 1 : -1;
			let dy = -1;
			if (worldActive[this.x + dx][this.y + dy] instanceof ActiveActorEvil) {
				dx = 0;
				this.move(dx, dy);
				this.stuck = false;
			} else {
				this.move(dx, dy);
				this.stuck = false;
			}
		}, time);

		function getBrickAt(x, y) {
			let { brokenBricks } = control.state;
			for (const brick of brokenBricks) {
				if (brick.x === x && brick.y === y) return brick;
			}
			return null;
		}
	}
}




