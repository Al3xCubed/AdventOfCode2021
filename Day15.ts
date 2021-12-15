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
		(cave) => {
			const values: Position[] = [];
			for (const row of cave.rows) {
				for (let i = 0; i < 5; i++) {
					values.push(
						...row.map((pos) => new Position(((pos.riskLevel - 1 + i) % 9) + 1)),
					);
				}
			}
			const valuesSoFar = [...values];
			for (let i = 1; i < 5; i++) {
				values.push(
					...valuesSoFar.map((pos) => new Position(((pos.riskLevel - 1 + i) % 9) + 1)),
				);
			}

			const bigCave = new Cave(5 * cave.width, 5 * cave.height, values);
			const path = bigCave.shortestPath(
				bigCave.get(0, 0),
				bigCave.get(bigCave.width - 1, bigCave.height - 1),
				(from, to) => to.riskLevel,
			);
			return path.map((step) => step.riskLevel).sum() - path[0].riskLevel;
		},
	],
);
