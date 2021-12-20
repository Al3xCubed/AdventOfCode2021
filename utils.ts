export function to2DArray<T>(arr: T[], width: number): T[][] {
	const gridArr = [];
	const values = [...arr];
	while (values.length > 0) gridArr.push(values.splice(0, width));
	return gridArr;
}

export function degToRad(deg: number) {
	return deg * (Math.PI / 180);
}

declare global {
	interface Array<T> {
		count(predicate: (value: T) => boolean): number;
		diff(other: Array<T>): Array<T>;
		distinct(): Array<T>;
		distinct(equalityOperator: (a: T, b: T) => boolean): Array<T>;
		intersect(other: Array<T>): Array<T>;
		product(): T;
		remove(value: T): void;
		sum(): T;
		transpose(): Array<T>;
	}
}

Array.prototype.count = function <T>(this: T[], predicate: (value: T) => boolean) {
	return this.filter(predicate).length;
};
Array.prototype.diff = function <T>(this: T[], other: T[]) {
	return this.filter((value) => !other.includes(value));
};
Array.prototype.distinct = function <T>(this: T[], equalityOperator?: (a: T, b: T) => boolean) {
	if (equalityOperator == undefined) {
		return this.filter((value, index) => this.indexOf(value) === index);
	} else {
		return this.filter(
			(value, index) => this.findIndex((val2) => equalityOperator(val2, value)) === index,
		);
	}
};
Array.prototype.intersect = function <T>(this: T[], other: T[]) {
	return this.filter((value) => other.includes(value));
};
Array.prototype.product = function <T extends number>(this: T[]) {
	return this.reduce((prev, curr) => prev * curr, 1);
};
Array.prototype.remove = function <T>(this: T[], value: T) {
	this.splice(this.indexOf(value), 1);
	return this;
};
Array.prototype.sum = function <T extends number>(this: T[]) {
	return this.reduce((prev, curr) => prev + curr, 0);
};
Array.prototype.transpose = function <T extends []>(this: T[]) {
	return this[0].map((x, i) => this.map((x) => x[i]));
};

export class Vector2 {
	public constructor(public x: number, public y: number) {}

	public static get zero() {
		return new Vector2(0, 0);
	}

	public add(other: Vector2) {
		this.x += other.x;
		this.y += other.y;
	}
}

export class Vector3 {
	public constructor(public x: number, public y: number, public z: number) {}

	public static get up() {
		return new Vector3(0, 1, 0);
	}

	public static get down() {
		return new Vector3(0, -1, 0);
	}

	public static get left() {
		return new Vector3(-1, 0, 0);
	}

	public static get right() {
		return new Vector3(1, 0, 0);
	}

	public static get forward() {
		return new Vector3(0, 0, 1);
	}

	public static get back() {
		return new Vector3(0, 0, -1);
	}

	public static get zero() {
		return new Vector3(0, 0, 0);
	}

	public get magnitudeSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	public get magnitude() {
		return Math.sqrt(this.magnitudeSq);
	}

	public clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	public add(other: Vector3) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	public sub(other: Vector3) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	public set(other: Vector3) {
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		return this;
	}

	public equals(other: Vector3) {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}

	public toString() {
		return `(${this.x}, ${this.y}, ${this.z})`;
	}

	public static add(a: Vector3, b: Vector3) {
		return a.clone().add(b);
	}

	public static sub(a: Vector3, b: Vector3) {
		return a.clone().sub(b);
	}

	public static manhattan(a: Vector3, b: Vector3) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
	}

	public static equals(a: Vector3, b: Vector3) {
		return a.equals(b);
	}
}

export class Matrix3x3 {
	public constructor(public matrix: number[][]) {}

	public round() {
		this.matrix = this.matrix.map((line) =>
			line.map((x) => (x < 0 ? Math.ceil(x) : Math.floor(x))),
		);
		return this;
	}

	public clone() {
		return new Matrix3x3([...this.matrix.map((line) => [...line])]);
	}

	public equals(other: Matrix3x3) {
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (this.matrix[i][j] !== other.matrix[i][j]) return false;
			}
		}
		return true;
	}

	public static mult(left: Matrix3x3, right: Vector3): Vector3;
	public static mult(left: Matrix3x3, right: Matrix3x3): Matrix3x3;
	public static mult(left: Matrix3x3, right: Vector3 | Matrix3x3): Matrix3x3 | Vector3 {
		const mat = right instanceof Vector3 ? [[right.x], [right.y], [right.z]] : right.matrix;

		const height = left.matrix.length;
		const width = mat[0].length;
		const result: number[][] = Array(height)
			.fill(0)
			.map(() => Array(width));
		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				result[row][col] = left.matrix[row]
					.map((x1, i1) => x1 * mat[i1][col])
					.reduce((a, x) => a + x);
			}
		}
		if (width === 1) return new Vector3(result[0][0], result[1][0], result[2][0]);
		else return new Matrix3x3(result);
	}

	public static round(matrix: Matrix3x3) {
		return matrix.clone().round();
	}

	public static equals(a: Matrix3x3, b: Matrix3x3) {
		return a.equals(b);
	}

	public static rotationMatrixX(radians: number) {
		return new Matrix3x3([
			[1, 0, 0],
			[0, Math.cos(radians), -Math.sin(radians)],
			[0, Math.sin(radians), Math.cos(radians)],
		]).round();
	}

	public static rotationMatrixY(radians: number) {
		return new Matrix3x3([
			[Math.cos(radians), 0, Math.sin(radians)],
			[0, 1, 0],
			[-Math.sin(radians), 0, Math.cos(radians)],
		]).round();
	}

	public static rotationMatrixZ(radians: number) {
		return new Matrix3x3([
			[Math.cos(radians), -Math.sin(radians), 0],
			[Math.sin(radians), Math.cos(radians), 0],
			[0, 0, 1],
		]).round();
	}
}

export class Range {
	public constructor(public min: number, public max: number) {}

	public get length() {
		return this.max - this.min + 1;
	}

	public contains(value: number) {
		return value >= this.min && value <= this.max;
	}

	public static parse(input: string) {
		const [min, max] = input.split("..").map((v) => parseInt(v));
		return new Range(min, max);
	}
}

export class GridPoint<T> extends Vector2 {
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
	private gridPoints: GridPoint<T>[][];
	public width: number;
	public height: number;

	public constructor(width: number, height: number, values?: T[]) {
		this.width = width;
		this.height = height;
		this.gridPoints = [];
		if (values != undefined) this.values = values;
	}

	public set values(values: T[]) {
		this.gridPoints = [];
		const all = [...values];
		while (all.length > 0) {
			const y = this.gridPoints.length;
			this.gridPoints.push(
				all.splice(0, this.width).map((v, x) => new GridPoint<T>(x, y, v)),
			);
		}
		this.gridPoints = this.gridPoints.transpose();
	}

	private get points() {
		return this.gridPoints.flatMap((row) => row);
	}

	public get values() {
		return this.points.map((p) => p.value);
	}

	public get rows() {
		return this.cols.transpose();
	}

	public get cols() {
		return this.gridPoints.map((row) => row.map((p) => p.value));
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
		return this.getNeighbourPoints(pointOrValue as T, includeDiagonals).map(
			(neighbour) => neighbour.value,
		);
	}

	private getNeighbourPoints(value: T, includeDiagonals: boolean): GridPoint<T>[];
	private getNeighbourPoints(point: GridPoint<T>, includeDiagonals: boolean): GridPoint<T>[];
	private getNeighbourPoints(
		pointOrValue: GridPoint<T> | T,
		includeDiagonals: boolean,
	): GridPoint<T>[] {
		const neighbours: GridPoint<T>[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				if (!includeDiagonals && Math.abs(dx) + Math.abs(dy) === 2) continue;

				const point =
					pointOrValue instanceof GridPoint ? pointOrValue : this.getPoint(pointOrValue);
				const x = point.x + dx;
				const y = point.y + dy;

				if (x < 0 || x >= this.width) continue;
				if (y < 0 || y >= this.height) continue;

				neighbours.push(this.gridPoints[x][y]);
			}
		}
		return neighbours;
	}

	public removeRow(index: number) {
		if (index < 0 || index >= this.height) return;

		this.gridPoints.map((row) => row.splice(index, 1));
		this.height--;
		this.syncPointCoords();
	}

	public removeCol(index: number) {
		if (index < 0 || index >= this.width) return;

		this.gridPoints.splice(index, 1);
		this.width--;
		this.syncPointCoords();
	}

	private syncPointCoords() {
		for (let y = 0; y < this.gridPoints.length; y++) {
			for (let x = 0; x < this.gridPoints[y].length; x++) {
				this.gridPoints[y][x].x = x;
				this.gridPoints[y][x].y = y;
			}
		}
	}

	private getPoint(value: T) {
		return this.points.find((p) => p.value === value)!;
	}

	public get(x: number, y: number) {
		return this.gridPoints[x][y].value;
	}

	public dijkstra(origin: T, length: (from: T, to: T) => number) {
		const q: GridPoint<T>[] = [];
		const dist: Map<GridPoint<T>, number> = new Map<GridPoint<T>, number>();
		const prev: Map<GridPoint<T>, GridPoint<T> | undefined> = new Map<
			GridPoint<T>,
			GridPoint<T> | undefined
		>();
		for (const point of this.points) {
			dist.set(point, Number.POSITIVE_INFINITY);
			prev.set(point, undefined);
			q.push(point);
		}
		const originPoint = this.getPoint(origin);
		dist.set(originPoint, 0);

		const totalPoints = q.length;
		let percent = Math.round(((totalPoints - q.length) / totalPoints) * 100);

		while (q.length > 0) {
			const u = q.sort((a, b) => dist.get(a)! - dist.get(b)!)[0];
			q.remove(u);

			const newPercent = Math.round(((totalPoints - q.length) / totalPoints) * 100);
			if (newPercent !== percent) {
				percent = newPercent;
				console.log(`${percent}%`);
			}

			for (const neighbour of this.getNeighbourPoints(u, false).intersect(q)) {
				const alt = dist.get(u)! + length(u.value, neighbour.value);
				if (alt < dist.get(neighbour)!) {
					dist.set(neighbour, alt);
					prev.set(neighbour, u);
				}
			}
		}

		return { dist, prev };
	}

	public shortestPath(source: T, target: T, length: (from: T, to: T) => number) {
		const { dist, prev } = this.dijkstra(source, length);

		const path: T[] = [];
		let u: T | undefined = target;
		if (prev.has(this.getPoint(u)) || u == source) {
			while (u != undefined) {
				path.splice(0, 0, u);
				u = prev.get(this.getPoint(u))?.value;
			}
		}
		return path;
	}

	public print() {
		console.log(this.toString());
	}

	public toString() {
		return this.gridPoints
			.transpose()
			.map((row) => row.map((p) => p.toString()).join(""))
			.join("\n");
	}
}

export class GraphNode<T> {
	public neighbours: GraphNode<T>[] = [];

	public constructor(public readonly value: T) {}

	public addNeighbour(neighbour: GraphNode<T>) {
		this.neighbours.push(neighbour);
	}
}

export class Graph<T> {
	private nodes: GraphNode<T>[];

	public constructor(values: T[], edges: [T, T][]) {
		this.nodes = values.map((value) => new GraphNode(value));

		edges.forEach((edge) => this.addEdge(edge));
	}

	private getNode(value: T) {
		return this.nodes.find((node) => node.value === value)!;
	}

	public addEdge(edge: [T, T]) {
		const fromNode = this.getNode(edge[0]);
		const toNode = this.getNode(edge[1]);
		fromNode.addNeighbour(toNode);
		toNode.addNeighbour(fromNode);
	}

	public getDistinctPaths(from: T, to: T, canVisitNode: (node: T, pathSoFar: T[]) => boolean) {
		const paths: T[][] = [];
		const fromNode = this.getNode(from);
		const toNode = this.getNode(to);

		function recur(node: GraphNode<T>, path: T[]) {
			for (const neighbour of node.neighbours) {
				if (!canVisitNode(neighbour.value, path)) continue;

				if (neighbour === toNode) {
					paths.push([...path, toNode.value]);
					continue;
				} else {
					recur(neighbour, [...path, neighbour.value]);
				}
			}
		}

		recur(fromNode, [fromNode.value]);

		return paths;
	}
}
