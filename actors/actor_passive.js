class PassiveActor extends Actor {

	/**
	 * Draws the active actor that calls this function
	 *
	 * @memberof ActiveActor
	 */
	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}

	/**
	 * Hides the active actor that calls this function
	 *
	 * @memberof ActiveActor
	 */
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}
}

// ===========================================================
// =============== MARKER INTERFACES (CLASSES) =============== 
// ===========================================================

/**
 *	This Class Represents all the Passive Actors that 
 *	lets the Active Actor move in the Y axis
 *
 * @class PassiveActorVertical
 * @extends {PassiveActor}
 */
class PassiveActorVertical extends PassiveActor {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 *	This Class Represents all the Passive Actors that
 *	lets the Active Actor move in the Y axis, but are needed
 *	for passing to the next level
 *	
 * @class PassiveActorVictoryVertical
 * @extends {PassiveActorVertical}
 */
class PassiveActorVictoryVertical extends PassiveActorVertical {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 *	This Class represents all the Passive Actors that
 *	the Active Actor can't go through in the Y axis.
 *
 * @class PassiveActorNoVertical
 * @extends {PassiveActor}
 */
class PassiveActorNoVertical extends PassiveActor {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 * This Class represents all the Passive Actors that
 * the Active Actor can go through in the X axis
 *
 * @class PassiveActorHorizontal
 * @extends {PassiveActorNoVertical}
 */
class PassiveActorHorizontal extends PassiveActorNoVertical {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 * This Class represents all the Passive Actors that
 * the Active Actor can't break
 *
 * @class PassiveActorSolid
 * @extends {PassiveActorNoVertical}
 */
class PassiveActorSolid extends PassiveActorNoVertical {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 *	This Class represents all the Passive Actors that
 *	the Active Actor can break
 *
 * @class PassiveActorSolidBreackable
 * @extends {PassiveActorSolid}
 */
class PassiveActorSolidBreackable extends PassiveActorSolid {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 * This Class represents all the Passive Actors that
 * apply gravity to the Active Actor
 *
 * @class PassiveActorGravity
 * @extends {PassiveActorNoVertical}
 */
class PassiveActorGravity extends PassiveActorNoVertical {
	constructor(x, y, type) {
		super(x, y, type);
	}
}

/**
 *	This Class represents all the Passive Actors that
 *	the Active Actor can "catch", for example, Gold
 *
 * @class PassiveActorCatchable
 * @extends {PassiveActorGravity}
 */
class PassiveActorCatchable extends PassiveActorGravity {
	constructor(x, y, type) {
		super(x, y, type);
		this.collected = false;
	}

	/**
	 * This method extends the hide from the PassiveActor.
	 * It was created because when the hero collects an item
	 * that item would draw an Empty on the hero position
	 * when the used item.hide()
	 *
	 * @memberof PassiveActorCatchable
	 */
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
		let { x, y } = hero;
		if (this.x === x && this.y === y) hero.show();
	}

	collect() {

	}
}

/**
 * This Class represents all the Passive Actors
 * that the hero can "catch", but are specificly
 * needed in order to pass the current level
 *
 * @class PassiveActorVictoryCatchable
 * @extends {PassiveActorCatchable}
 */
class PassiveActorVictoryCatchable extends PassiveActorCatchable {
	constructor(x, y, type) {
		super(x, y, type);
		this.collected = false;
	}
}

// ==================================================
// =============== ALL PASSIVE ACTORS ===============
// ==================================================

class Brick extends PassiveActorSolidBreackable {
	constructor(x, y) {
		super(x, y, "brick");
		this.broken = false;
	}

	/**
	 *	This method hides the brick for 8 seconds (8000ms).
	 *	If the player breaks a brick and goes to the next level,
	 *	that broken brick does not get respawned.
	 *
	 * @memberof Brick
	 */
	break() {
		this.addBrokenBrick();
		this.hide();
		let oldLevel = control.currentLevel;
		setTimeout(() => {
			let { x, y } = hero
			if (oldLevel !== control.currentLevel) {
				let { x, y } = this;
				let { world } = control;
				if (!(world[x][y] instanceof Empty)) {
					return;
				}
				this.hide();
				return;
			}
			this.removeBrokenBrick();
			this.show();
			if (this.x === x && this.y === y) {
				control.totalLives = control.totalLives - 1;
				updateVisualMenNumber(control.totalLives);
				if (control.totalLives === 0) {
					gameOverDisplay();
				} else {
					loseLevelDisplay();
				}
			}
		}, 8000)
	}

	/**
	 *	This method adds this brick to the state of control. (control.state)
	 *	That state contains all the bricks that were broken.
	 *
	 * @memberof Brick
	 */
	addBrokenBrick() {
		this.broken = true;
		control.state.brokenBricks.push(this);
	}

	/**
	 *	This method removes the broken brick from control.state
	 *	That state contains all the bricks that were broken
	 *
	 * @memberof Brick
	 */
	removeBrokenBrick() {
		this.broken = false;
		let { brokenBricks } = control.state;
		let newArr = brokenBricks.filter(brick => brick.broken === true);
		control.state.brokenBricks = newArr;
	}
}

class Chimney extends PassiveActorGravity {
	constructor(x, y) {
		super(x, y, "chimney");
	}
}

class Empty extends PassiveActorGravity {
	constructor() {
		super(-1, -1, "empty");
	}
	show() { }
	hide() { }
}

class Gold extends PassiveActorVictoryCatchable {
	constructor(x, y) {
		super(x, y, "gold");
	}

	/**
	 * This method removes the gold from the map, 
	 * increases the totalPoints and updates the VisualScore
	 *
	 * @memberof Gold
	 */
	collect() {
		if (this.collected) return;
		this.hide();
		control.totalPoints = control.totalPoints + 250;
		updateVisualScore(control.totalPoints);
		this.collected = true;
	}
}

class Invalid extends PassiveActorSolid {
	constructor(x, y) {
		super(x, y, "invalid");
	}
}



class Ladder extends PassiveActorVictoryVertical {
	constructor(x, y) {
		super(x, y, "ladder");
		this.visible = false;
	}

	// Shows the ladder if it's visible
	show() {
		if (this.visible)
			super.show();
	}

	// Hides the ladder if it's invisible
	hide() {
		if (this.visible)
			super.hide();
	}

	// Updates the visibility of the ladder, and shows it
	makeVisible() {
		this.visible = true;
		this.show();
	}
}

class Rope extends PassiveActorHorizontal {
	constructor(x, y) {
		super(x, y, "rope");
	}
}

class Stone extends PassiveActorSolid {
	constructor(x, y) {
		super(x, y, "stone");
	}
}