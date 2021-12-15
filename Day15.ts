import "./utils.ts";
import { Day } from "./ADay.ts";
import { Grid } from "./utils.ts";

class Position {
	public constructor(public readonly riskLevel: number) {}

	public toString() {
		return `${this.riskLevel}`;
	}
}

class Cave extends Grid<Position> {}

export const DAY15 = new Day(
	15,
	(input) => {
		const width = input.split("\n")[0].length;
		const height = input.split("\n").length;
		const values = input
			.split("\n")
			.flatMap((row) => row.split("").map((v) => new Position(parseInt(v))));
		return new Cave(width, height, values);
	},
	[
		(cave) => {
			const path = cave.shortestPath(
				cave.get(0, 0),
				cave.get(cave.width - 1, cave.height - 1),
				(from, to) => to.riskLevel,
			);
			return path.map((step) => step.riskLevel).sum() - path[0].riskLevel;
		},
	],
);
