import "./utils.ts";
import { Day } from "./ADay.ts";
import { Grid, Vector2 } from "./utils.ts";

class Fold {
	public constructor(public readonly axis: "x" | "y", public readonly value: number) {}

	public static parse(input: string): Fold {
		return new Fold(
			input.substr("fold along ".length, 1) as "x" | "y",
			parseInt(input.substr("fold along x=".length)),
		);
	}
}

class Mark {
	public folded: boolean = false;

	public constructor(public marked: boolean) {}

	public toString() {
		return this.folded ? "-" : this.marked ? "#" : ".";
	}
}

class Paper {
	private grid: Grid<Mark>;

	public constructor(marks: Vector2[]) {
		const width = Math.max(...marks.map((mark) => mark.x)) + 1;
		const height = Math.max(...marks.map((mark) => mark.y)) + 1;

		const values: Mark[] = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				values.push(
					new Mark(marks.find((mark) => mark.x === x && mark.y === y) != undefined),
				);
			}
		}

		this.grid = new Grid<Mark>(width, height, values);
	}

	public get markCount() {
		return this.grid.values.count((mark) => mark.marked);
	}

	public print() {
		this.grid.print();
	}

	public toString() {
		return this.grid.toString();
	}

	private merge(sourceMarks: Mark[], targetMarks: Mark[]) {
		if (sourceMarks.length !== targetMarks.length) {
			throw new Error("Expected same length");
		}

		for (let i = 0; i < targetMarks.length; i++) {
			targetMarks[i].marked ||= sourceMarks[i].marked;
		}
	}

	public fold(fold: Fold) {
		const things = fold.axis === "x" ? this.grid.cols : this.grid.rows;
		things[fold.value].forEach((mark) => (mark.folded = true));

		for (let i = 0; i < fold.value; i++) {
			if (fold.value + 1 + i >= things.length) continue;

			this.merge(things[fold.value + 1 + i], things[fold.value - 1 - i]);
		}
		for (let i = things.length - 1; i >= fold.value; i--) {
			if (fold.axis === "x") this.grid.removeCol(i);
			else this.grid.removeRow(i);
		}
	}
}

export const DAY13 = new Day(
	13,
	(input) => {
		const [marksStr, foldsStr] = input.split("\n\n");
		const marks = marksStr.split("\n").map((mark) => {
			const markN = mark.split(",").map((n) => parseInt(n));
			return new Vector2(markN[0], markN[1]);
		});
		const folds = foldsStr.split("\n").map((fold) => Fold.parse(fold));

		return { paper: new Paper(marks), folds };
	},
	[
		({ paper, folds }) => {
			paper.fold(folds[0]);
			return paper.markCount;
		},
		({ paper, folds }) => {
			for (let i = 1; i < folds.length; i++) {
				paper.fold(folds[i]);
			}
			return `\n${paper.toString()}`;
		},
	],
);
