import "./utils.ts";
import { Day } from "./ADay.ts";

abstract class ASnailfishNumber {
	public parent?: ASnailfishNumber;

	public constructor() {
		this.parent = undefined;
	}

	public add(other: ASnailfishNumber) {
		const left = this.clone();
		const right = other.clone();
		const res = new SnailfishPair(left, right);
		res.reduce();
		return res;
	}

	public abstract get magnitude(): number;

	public abstract reduce(): void;

	public abstract clone(): ASnailfishNumber;

	public abstract toString(): string;

	public static parse(input: string) {
		function helper(index: number): [ASnailfishNumber, number] {
			while (true) {
				if (input[index].match(/[0-9]/)) {
					let numberStr = "";
					while (input[index].match(/[0-9]/)) {
						numberStr += input[index++];
					}
					let number = parseInt(numberStr);
					return [new SnailfishNumber(number), index];
				} else if (input[index] === "[") {
					const [left, newIndex] = helper(index + 1);
					const [right, newIndex2] = helper(newIndex + ",".length);
					return [new SnailfishPair(left, right), newIndex2 + "]".length];
				}
			}
		}

		return helper(0)[0];
	}
}

class SnailfishPair extends ASnailfishNumber {
	private _left!: ASnailfishNumber;
	private _right!: ASnailfishNumber;

	public constructor(left: ASnailfishNumber, right: ASnailfishNumber) {
		super();
		this.left = left;
		this.right = right;
	}

	public get left(): ASnailfishNumber {
		return this._left;
	}

	public set left(left: ASnailfishNumber) {
		this._left = left;
		left.parent = this;
	}

	public get right(): ASnailfishNumber {
		return this._right;
	}

	public set right(right: ASnailfishNumber) {
		this._right = right;
		right.parent = this;
	}

	public override get magnitude() {
		return 3 * this.left.magnitude + 2 * this.right.magnitude;
	}

	public diveRight(): SnailfishNumber {
		if (this.right instanceof SnailfishPair) {
			return this.right.diveRight();
		} else return this.right as SnailfishNumber;
	}

	public diveLeft(): SnailfishNumber {
		if (this.left instanceof SnailfishPair) {
			return this.left.diveLeft();
		} else return this.left as SnailfishNumber;
	}

	public explode() {
		function findFirstLeftNumber(origin: ASnailfishNumber): SnailfishNumber | undefined {
			if (origin.parent == undefined) return undefined;

			const parent = origin.parent;
			if (parent instanceof SnailfishPair) {
				if (parent.right === origin) {
					if (parent.left instanceof SnailfishPair) {
						return parent.left.diveRight();
					} else return parent.left as SnailfishNumber;
				} else return findFirstLeftNumber(parent);
			}
			return undefined;
		}
		function findFirstRightNumber(origin: ASnailfishNumber): SnailfishNumber | undefined {
			if (origin.parent == undefined) return undefined;

			const parent = origin.parent;
			if (parent instanceof SnailfishPair) {
				if (parent.left === origin) {
					if (parent.right instanceof SnailfishPair) {
						return parent.right.diveLeft();
					} else return parent.right as SnailfishNumber;
				} else return findFirstRightNumber(parent);
			}
			return undefined;
		}
		const firstLeftNumber = findFirstLeftNumber(this);
		if (firstLeftNumber != undefined) {
			firstLeftNumber.value += (this.left as SnailfishNumber).value;
		}
		const firstRightNumber = findFirstRightNumber(this);
		if (firstRightNumber != undefined) {
			firstRightNumber.value += (this.right as SnailfishNumber).value;
		}

		const parent = this.parent as SnailfishPair;
		if (parent.left === this) {
			parent.left = new SnailfishNumber(0);
		} else {
			parent.right = new SnailfishNumber(0);
		}
	}

	private get explodePair(): SnailfishPair | undefined {
		function helper(current: ASnailfishNumber, depth: number): SnailfishPair | undefined {
			if (depth >= 4 && current instanceof SnailfishPair) return current;

			if (current instanceof SnailfishPair) {
				const leftPair = helper(current.left, depth + 1);
				if (leftPair == undefined) return helper(current.right, depth + 1);
				else return leftPair;
			}
		}
		return helper(this, 0);
	}

	private get splitNumber(): SnailfishNumber | undefined {
		function helper(current: ASnailfishNumber): SnailfishNumber | undefined {
			if (current instanceof SnailfishNumber) {
				if (current.value >= 10) return current;
			} else if (current instanceof SnailfishPair) {
				const leftNumber = helper(current.left);
				if (leftNumber == undefined) return helper(current.right);
				else return leftNumber;
			}
		}
		return helper(this);
	}

	public override reduce() {
		while (true) {
			const explodePair = this.explodePair;

			if (explodePair != undefined) {
				explodePair.explode();
			} else {
				const splitNumber = this.splitNumber;
				if (splitNumber != undefined) {
					splitNumber.split();
				} else break;
			}
		}
	}

	public override clone() {
		return new SnailfishPair(this.left.clone(), this.right.clone());
	}

	public override toString() {
		return `[${this.left.toString()},${this.right.toString()}]`;
	}
}

class SnailfishNumber extends ASnailfishNumber {
	public constructor(public value: number) {
		super();
	}

	public split() {
		const parent = this.parent as SnailfishPair;
		const splitted = new SnailfishPair(
			new SnailfishNumber(Math.floor(this.value / 2)),
			new SnailfishNumber(Math.ceil(this.value / 2)),
		);
		if (parent.left === this) {
			parent.left = splitted;
		} else {
			parent.right = splitted;
		}
	}

	public override get magnitude() {
		return this.value;
	}

	public override reduce() {
		return;
	}

	public override clone() {
		return new SnailfishNumber(this.value);
	}

	public override toString() {
		return `${this.value}`;
	}
}

export const DAY18 = new Day(
	18,
	(input) => {
		return input.split("\n").map((n) => SnailfishNumber.parse(n));
	},
	[(numbers) => numbers.reduce((prev, curr) => prev.add(curr), numbers[0]).magnitude],
);
