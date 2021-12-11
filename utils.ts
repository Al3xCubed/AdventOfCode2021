export function to2DArray<T>(arr: T[], width: number): T[][] {
	const gridArr = [];
	const values = [...arr];
	while (values.length > 0) gridArr.push(values.splice(0, width));
	return gridArr;
}

declare global {
	interface Array<T> {
		count(predicate: (value: T) => boolean): number;
		product(): T;
		sum(): T;
	}
}

Array.prototype.count = function <T>(this: T[], predicate: (value: T) => boolean) {
	return this.filter(predicate).length;
};
Array.prototype.product = function <T extends number>(this: T[]) {
	return this.reduce((prev, curr) => prev * curr, 1);
};
Array.prototype.sum = function <T extends number>(this: T[]) {
	return this.reduce((prev, curr) => prev + curr, 0);
};

export class Point {
	public constructor(public readonly x: number, public readonly y: number) {}
}

export class GridPoint<T> extends Point {
	public value: T;

	public constructor(x: number, y: number, value: T) {
		super(x, y);
		this.value = value;
	}

	public toString() {
		return `${this.value}`;
	}
}

export class Grid<T> {
	private points: GridPoint<T>[];
	public readonly width: number;
	public readonly height: number;

	public constructor(width: number, height: number, values?: T[]) {
		this.width = width;
		this.height = height;
		this.points = [];
		if (values != undefined) this.values = values;
	}

	public set values(values: T[]) {
		this.points = values.map(
			(value, index) =>
				new GridPoint<T>(index % this.width, Math.floor(index / this.height), value),
		);
	}

	public get values() {
		return this.points.map((p) => p.value);
	}

	public getWithNeighbours(includeDiagonals: boolean) {
		return this.points.map((point) => ({
			self: point.value,
			neighbours: this.getNeighbours(point, includeDiagonals),
		}));
	}

	public getNeighbours(value: T, includeDiagonals: boolean): T[];
	public getNeighbours(point: GridPoint<T>, includeDiagonals: boolean): T[];
	public getNeighbours(pointOrValue: GridPoint<T> | T, includeDiagonals: boolean): T[] {
		const neighbours: T[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				if (!includeDiagonals && Math.abs(dx) + Math.abs(dy) === 2) continue;

				const point =
					pointOrValue instanceof GridPoint
						? pointOrValue
						: this.points.find((point) => point.value === pointOrValue)!;
				const x = point.x + dx;
				const y = point.y + dy;

				if (x < 0 || x >= this.width) continue;
				if (y < 0 || y >= this.height) continue;

				neighbours.push(this.points[x + this.width * y].value);
			}
		}
		return neighbours;
	}

	public print() {
		console.log(this.toString());
	}

	public toString() {
		return to2DArray(this.points, this.width)
			.map((row) => row.map((v) => v.toString()).join(""))
			.join("\n");
	}
}