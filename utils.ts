export function to2DArray<T>(arr: T[], width: number): T[][] {
	const gridArr = [];
	const values = [...arr];
	while (values.length > 0) gridArr.push(values.splice(0, width));
	return gridArr;
}

declare global {
	interface Array<T> {
		count(predicate: (value: T) => boolean): number;
		diff(other: Array<T>): Array<T>;
		distinct(): Array<T>;
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
Array.prototype.distinct = function <T>(this: T[]) {
	return this.filter((value, index) => this.indexOf(value) === index);
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

export class Point {
	public constructor(public x: number, public y: number) {}
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
