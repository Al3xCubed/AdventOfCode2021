import { Day } from "./ADay.ts";

class Point {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly height: number,
	) {}
}

class Heightmap {
	public readonly points: Point[][];
	public readonly width: number;
	public readonly height: number;

	public constructor(heights: number[][]) {
		this.width = heights[0].length;
		this.height = heights.length;
		this.points = [...Array(this.width)].map((e) => Array(this.height));
		heights.forEach((row, y) =>
			row.forEach((h, x) => (this.points[x][y] = new Point(x, y, h))),
		);
	}

	public get lowPoints() {
		const lowPoints: Point[] = [];
		this.points
			.flatMap((row) => row)
			.forEach((center) => {
				const up = this.neighbour(center, 0, -1);
				const down = this.neighbour(center, 0, 1);
				const left = this.neighbour(center, -1, 0);
				const right = this.neighbour(center, 1, 0);

				const all = [center, up, down, left, right]
					.filter((point) => point != undefined)
					.map((point) => point!.height);
				const min = Math.min(...all);
				if (min === center.height && all.filter((height) => height === min).length === 1) {
					lowPoints.push(center);
				}
			});
		return lowPoints;
	}

	public get riskLevel() {
		return this.lowPoints
			.map((point) => this.points[point.x][point.y].height + 1)
			.reduce((prev, curr) => prev + curr, 0);
	}

	public get basins() {
		return this.lowPoints.map((lowPoint) => this.findBasin(lowPoint));
	}

	public neighbour(point: Point, deltaX: number, deltaY: number) {
		const x = point.x + deltaX;
		const y = point.y + deltaY;
		if (x < 0 || x >= this.width) return undefined;
		if (y < 0 || y >= this.height) return undefined;

		return this.points[x][y];
	}

	private findBasin(point: Point) {
		const basin = new Set<Point>();

		this.findBasinRecur(point, basin);
		return [...basin];
	}

	private findBasinRecur(point: Point, points: Set<Point>) {
		points.add(point);

		const neighbours = [
			this.neighbour(point, 0, -1),
			this.neighbour(point, 0, 1),
			this.neighbour(point, -1, 0),
			this.neighbour(point, 1, 0),
		].filter((neighbour) => neighbour != undefined) as Point[];
		neighbours.forEach((neighbour) => {
			if (points.has(neighbour)) return;
			if (neighbour.height === 9) return;

			this.findBasinRecur(neighbour, points);
		});
	}
}

export const DAY9 = new Day(
	9,
	(input) => {
		const heights: number[][] = input
			.split("\n")
			.map((line) => line.split("").map((n) => parseInt(n)));
		return new Heightmap(heights);
	},
	[
		(heightMap) => heightMap.riskLevel,
		(heightMap) =>
			heightMap.basins
				.map((basin) => basin.length)
				.sort((a, b) => b - a)
				.splice(0, 3)
				.reduce((prev, curr) => prev * curr, 1),
	],
);
