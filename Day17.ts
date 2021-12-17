import "./utils.ts";
import { Day } from "./ADay.ts";
import { Range, Vector2 } from "./utils.ts";

class Target {
	public constructor(public readonly xRange: Range, public readonly yRange: Range) {}

	public inTarget(point: Vector2) {
		return this.xRange.contains(point.x) && this.yRange.contains(point.y);
	}

	public hasOvershot(point: Vector2) {
		return point.x > this.xRange.max || point.y < this.yRange.min;
	}
}

class Trajectory {
	private velocity: Vector2;
	public position: Vector2;

	public constructor(public initalVelocity: Vector2) {
		this.velocity = new Vector2(initalVelocity.x, initalVelocity.y);
		this.position = Vector2.zero;
	}

	public step() {
		this.position.add(this.velocity);
		if (this.velocity.x > 0) this.velocity.x--;
		else if (this.velocity.x < 0) this.velocity.x++;
		this.velocity.y--;
	}

	public simulateForTarget(target: Target, afterEachStep: (self: this) => void) {
		while (!target.inTarget(this.position) && !target.hasOvershot(this.position)) {
			this.step();
			afterEachStep(this);
		}
	}

	public static findTrajectoriesForTarget(target: Target) {
		let allTrajectories: Trajectory[] = [];

		for (let x = 0; x <= target.xRange.max; x++) {
			for (let y = 1000; y >= target.yRange.min; y--) {
				allTrajectories.push(new Trajectory(new Vector2(x, y)));
			}
		}
		allTrajectories.forEach((trajectory) => trajectory.simulateForTarget(target, () => {}));

		return allTrajectories
			.filter((trajectory) => target.inTarget(trajectory.position))
			.map((trajectory) => new Trajectory(trajectory.initalVelocity));
	}
}

export const DAY17 = new Day(
	17,
	(input) => {
		const rangeStr = input.substr("target area: ".length);
		const [xRange, yRange] = rangeStr.split(", ").map((range) => Range.parse(range.substr(2)));
		return new Target(xRange, yRange);
	},
	[
		(target) => {
			let max = Number.NEGATIVE_INFINITY;
			Trajectory.findTrajectoriesForTarget(target).forEach((trajectory) =>
				trajectory.simulateForTarget(
					target,
					(traj) => (max = Math.max(max, traj.position.y)),
				),
			);
			return max;
		},
	],
);
