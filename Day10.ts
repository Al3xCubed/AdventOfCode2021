import { Day } from "./ADay.ts";

class Pair {
	public constructor(
		public readonly opening: string,
		public readonly closing: string,
		public readonly corruptPenalty: number,
		public readonly autocompletePoints: number,
	) {}
}

const pairs = [
	new Pair("(", ")", 3, 1),
	new Pair("[", "]", 57, 2),
	new Pair("{", "}", 1197, 3),
	new Pair("<", ">", 25137, 4),
];

class Line {
	public corruption?: { index: number; expected: string; found: string };
	public stack: string[];

	public constructor(public line: string) {
		this.corruption = undefined;
		this.stack = [];

		for (let i = 0; i < this.line.length; i++) {
			const startPair = pairs.find((pair) => pair.opening === this.line[i]);
			if (startPair != undefined) {
				this.stack.push(startPair.closing);
			} else {
				const expected = this.stack.pop()!;
				if (this.line[i] !== expected) {
					this.corruption = { index: i, expected, found: this.line[i] };
					break;
				}
			}
		}
	}

	public get isCorrupt() {
		return this.corruption != undefined;
	}
}

export const DAY10 = new Day(
	10,
	(input) => {
		return input.split("\n").map((str) => new Line(str));
	},
	[
		(lines) =>
			lines
				.filter((line) => line.isCorrupt)
				.map((line) => line.corruption!)
				.map((corruption) => pairs.find((pair) => pair.closing === corruption!.found))
				.reduce((prev, corruption) => prev + corruption!.corruptPenalty, 0),
		(lines) => {
			const scores = lines
				.filter((line) => !line.isCorrupt)
				.map((line) =>
					[...line.stack]
						.reverse()
						.reduce(
							(prev, char) =>
								5 * prev +
								pairs.find((pair) => pair.closing === char)!.autocompletePoints,
							0,
						),
				)
				.sort((a, b) => a - b);
			return scores[Math.floor(scores.length / 2)];
		},
	],
);
