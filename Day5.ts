import { Day } from "./ADay.ts";

class Point {
	public constructor(public x: number, public y: number) {}
}

class Line {
	public constructor(public p1: Point, public p2: Point) {}

	public get isDiagonal() {
		return !(this.p1.x === this.p2.x || this.p1.y === this.p2.y);
	}

	public get points() {
		const points: Point[] = [];

		// const xCondition = (current: Point) =>
		// 	this.p1.x <= this.p2.x ? current.x <= this.p2.x : current.x >= this.p2.x;
		// const xIncrement = (current: Point) => (this.p1.x <= this.p2.x ? current.x++ : current.x--);
		// const yCondition = (current: Point) =>
		// 	this.p1.y <= this.p2.y ? current.y <= this.p2.y : current.y >= this.p2.y;
		// const yIncrement = (current: Point) => (this.p1.y <= this.p2.y ? current.y++ : current.y--);

		// const current = new Point(this.p1.x, this.p1.y);
		// for (; xCondition(current); xIncrement(current)) {
		// 	for (; yCondition(current); yIncrement(current)) {
		// 		points.push(new Point(current.x, current.y));
		// 	}
		// }

		if (!this.isDiagonal) {
			for (let x = Math.min(this.p1.x, this.p2.x); x <= Math.max(this.p1.x, this.p2.x); x++) {
				for (
					let y = Math.min(this.p1.y, this.p2.y);
					y <= Math.max(this.p1.y, this.p2.y);
					y++
				) {
					points.push(new Point(x, y));
				}
			}
		} else {
			let x = this.p1.x;
			let y = this.p1.y;
			while (x !== this.p2.x) {
				points.push(new Point(x, y));
				if (x <= this.p2.x) x++;
				else x--;
				if (y <= this.p2.y) y++;
				else y--;
			}
			points.push(new Point(x, y));
		}

		return points;
	}
}

class Board {
	private cells: number[][] = [];

	public get coverings() {
		return this.cells.flatMap((row) => row).flatMap((row) => row);
	}

	public draw(line: Line, considerDiagonals: boolean = false) {
		if (line.isDiagonal && !considerDiagonals) return;

		for (const point of line.points) {
			while (point.x >= this.cells.length) this.cells.push([]);
			while (point.y >= this.cells[point.x].length) this.cells[point.x].push(0);

			this.cells[point.x][point.y]++;
		}
	}
}

export const DAY5 = new Day(
	5,
	(input) => {
		const lines = input
			.split("\n")
			.map((line) =>
				line.split(" -> ").map((pair) => pair.split(",").map((coord) => parseInt(coord))),
			)
			.map(
				(line) =>
					new Line(new Point(line[0][0], line[0][1]), new Point(line[1][0], line[1][1])),
			);

		return { lines };
	},
	[
		(data) => {
			const board = new Board();
			for (const line of data.lines) {
				board.draw(line, false);
			}
			let numDangerousPoints = board.coverings.filter((covering) => covering >= 2).length;
			return numDangerousPoints;
		},
		(data) => {
			const board = new Board();
			for (const line of data.lines) {
				board.draw(line, true);
			}
			let numDangerousPoints = board.coverings.filter((covering) => covering >= 2).length;
			return numDangerousPoints;
		},
	],
);
