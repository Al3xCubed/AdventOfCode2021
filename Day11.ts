import { Day } from "./ADay.ts";
import { Grid } from "./utils.ts";

class Octopus {
	public hasFlashed: boolean = false;
	public flashes: number = 0;

	public constructor(public energy: number, private readonly grid: Grid<Octopus>) {}

	public step() {
		this.increaseEnergy();
	}

	public endStep() {
		this.hasFlashed = false;
		if (this.energy >= 10) {
			this.energy = 0;
		}
	}

	public increaseEnergy() {
		this.energy++;
		if (this.energy === 10) {
			this.flash();
		}
	}

	public flash() {
		if (this.hasFlashed) return;

		this.flashes++;
		this.hasFlashed = true;
		this.grid.getNeighbours(this, true).forEach((neighbour) => neighbour.increaseEnergy());
	}

	public toString() {
		return `${this.energy}`;
	}
}

export const DAY11 = new Day(
	11,
	(input) => {
		const grid = new Grid<Octopus>(10, 10);
		grid.values = input
			.split("\n")
			.join("")
			.split("")
			.map((n) => new Octopus(parseInt(n), grid));
		return grid;
	},
	[
		(grid) => {
			let steps = 100;
			for (let i = 0; i < steps; i++) {
				grid.values.forEach((octopus) => octopus.step());
				grid.values.forEach((octopus) => octopus.endStep());
			}
			return grid.values.map((octopus) => octopus.flashes).sum();
		},
		(grid) => {
			let steps = 1;
			while (true) {
				grid.values.forEach((octopus) => octopus.step());
				if (grid.values.every((octopus) => octopus.hasFlashed)) return steps;
				grid.values.forEach((octopus) => octopus.endStep());
				steps++;
			}
		},
	],
	true,
);
