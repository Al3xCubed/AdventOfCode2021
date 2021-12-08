import { Day } from "./ADay.ts";

class Cell {
	public value: number;
	public marked: boolean;

	public constructor(value: number) {
		this.value = value;
		this.marked = false;
	}

	public mark() {
		this.marked = true;
	}
}

class BingoCard {
	public cells: Cell[];
	public rows: Cell[][];
	public columns: Cell[][];

	public constructor(width: number, height: number, numbers: number[]) {
		this.cells = numbers.map((number) => new Cell(number));

		this.rows = [...Array(height)].map((e) => Array(width));
		this.columns = [...Array(width)].map((e) => Array(height));
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const cell = this.cells[x + width * y];
				this.rows[x][y] = cell;

				this.columns[y][x] = cell;
			}
		}
	}

	public get hasWon() {
		return (
			this.rows.some((row) => row.every((cell) => cell.marked)) ||
			this.columns.some((col) => col.every((cell) => cell.marked))
		);
	}

	public get allMarked() {
		return this.cells.filter((cell) => cell.marked);
	}

	public get allUnmarked() {
		return this.cells.filter((cell) => !cell.marked);
	}

	public mark(value: number) {
		for (const cell of this.cells) {
			if (cell.value === value) cell.mark();
		}
	}
}

export const DAY4 = new Day(
	4,
	(input) => {
		const firstLineEndIndex = input.indexOf("\n");
		const firstLine = input.substring(0, firstLineEndIndex);
		const restOfInput = input.substring(firstLineEndIndex + 1);
		const draws = firstLine
			.trim()
			.split(",")
			.map((n) => parseInt(n));

		const numbers = restOfInput.split("\n\n").map((cardStr) =>
			cardStr
				.trim()
				.split(/\n+/g)
				.map((rowString) => {
					return rowString
						.trim()
						.split(/\s+/)
						.map((n) => parseInt(n));
				}),
		);

		const cards: BingoCard[] = numbers.map((rows) => {
			return new BingoCard(
				rows[0].length,
				rows.length,
				rows.flatMap((n) => n),
			);
		});

		return { cards, draws };
	},
	[
		(data) => {
			for (const draw of data.draws) {
				for (const card of data.cards) {
					card.mark(draw);
					if (card.hasWon) {
						return (
							card.allUnmarked
								.map((cell) => cell.value)
								.reduce((prev, curr) => prev + curr, 0) * draw
						);
					}
				}
			}
		},
		(data) => {
			const aliveCards: Set<BingoCard> = new Set(data.cards);
			for (const draw of data.draws) {
				for (const card of aliveCards) {
					card.mark(draw);
					if (card.hasWon) {
						if (aliveCards.size == 1) {
							return (
								card.allUnmarked
									.map((cell) => cell.value)
									.reduce((prev, curr) => prev + curr, 0) * draw
							);
						} else aliveCards.delete(card);
					}
				}
			}
		},
	],
);
