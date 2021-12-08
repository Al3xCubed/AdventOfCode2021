import { Day } from "./ADay.ts";

function onlyUnique<T>(value: T, index: number, self: T[]) {
	return self.indexOf(value) === index;
}

type Segment = "a" | "b" | "c" | "d" | "e" | "f" | "g";

class Digit {
	public readonly segments: Segment[];

	public constructor(digit: string) {
		this.segments = digit.split("").filter(onlyUnique).sort() as Segment[];
	}

	public get length() {
		return this.segments.length;
	}

	public toString() {
		return this.segments.join("");
	}
}

class DisplayReading {
	public readonly allDigits: Digit[];
	public readonly displayed: Digit[];
	public readonly digitToNumber: { [digit: string]: number };
	public readonly numberToDigit: { [number: number]: Digit };

	private unmappedDigits: Digit[];

	public constructor(allDigits: string[], displayed: string[]) {
		this.allDigits = allDigits.map((digit) => new Digit(digit));
		this.displayed = displayed.map((digit) => new Digit(digit));

		this.unmappedDigits = [...this.allDigits];

		this.digitToNumber = {};
		this.numberToDigit = {};

		// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
		// 6, 2, 5, 5, 4, 5, 6, 3, 7, 6
		this.findSegmentsByLength(1, 2);
		// 0, 2, 3, 4, 5, 6, 7, 8, 9
		// 6, 5, 5, 4, 5, 6, 3, 7, 6
		this.findSegmentsByLength(4, 4);
		// 0, 2, 3, 5, 6, 7, 8, 9
		// 6, 5, 5, 5, 6, 3, 7, 6
		this.findSegmentsByLength(7, 3);
		// 0, 2, 3, 5, 6, 8, 9
		// 6, 5, 5, 5, 6, 7, 6
		this.findSegmentsByLength(8, 7);
		// 0, 2, 3, 5, 6, 9
		// 6, 5, 5, 5, 6, 6
		this.findSegmentsByContains(3, 5, [1]);
		// 0, 2, 5, 6, 9
		// 6, 5, 5, 6, 6
		this.findSegmentsByContains(9, 6, [3]);
		// 0, 2, 5, 6
		// 6, 5, 5, 6
		this.findSegmentsByContains(0, 6, [1]);
		// 2, 5, 6
		// 5, 5, 6
		this.findSegmentsByLength(6, 6);
		// 2, 5
		// 5, 5
		this.findSegmentsBySegmentMatch(5, 5, [{ number: 4, segmentMatchCount: 3 }]);
		// 2
		// 5
		this.findSegmentsByLength(2, 5);
	}

	private findSegmentsBySegmentMatch(
		number: number,
		length: number,
		segmentsMatches: { number: number; segmentMatchCount: number }[],
	) {
		const digitMatches = this.unmappedDigits
			.filter((digit) => digit.length === length)
			.filter((digit) =>
				segmentsMatches.every(
					(segmentMatch) =>
						this.numberToDigit[segmentMatch.number].segments.filter((seg) =>
							digit.segments.includes(seg),
						).length === segmentMatch.segmentMatchCount,
				),
			);
		this.setDigit(digitMatches, number);
	}

	private findSegmentsByContains(number: number, length: number, shouldContain: number[]) {
		const shouldContainDigits = shouldContain.map((number) => this.numberToDigit[number]);
		const digitMatches = this.unmappedDigits
			.filter((digit) => digit.length === length)
			.filter((digit) =>
				shouldContainDigits.every((shouldContainDigit) =>
					shouldContainDigit.segments.every((segment) =>
						digit.segments.includes(segment),
					),
				),
			);
		this.setDigit(digitMatches, number);
	}

	private findSegmentsByLength(number: number, length: number) {
		const digitMatches = this.unmappedDigits.filter((digit) => digit.length === length)!;
		this.setDigit(digitMatches, number);
	}

	private setDigit(digitMatches: Digit[], number: number) {
		if (digitMatches.length !== 1) throw "Expected exactly 1 match";

		const digit = digitMatches[0];
		this.digitToNumber[digit.toString()] = number;
		this.numberToDigit[number] = digit;
		this.unmappedDigits.splice(this.unmappedDigits.indexOf(digit), 1);
	}
}

export const DAY8 = new Day(
	8,
	(input) =>
		input.split("\n").map((line) => {
			const parts = line.split("|").map((part) => part.trim());
			return new DisplayReading(parts[0].split(" "), parts[1].split(" "));
		}),
	[
		(readings) => {
			let uniqueDigitCount = 0;
			const uniqueCounts = new Set<number>([2, 4, 3, 7]);
			readings.forEach((reading) => {
				reading.displayed
					.filter((displayed) => uniqueCounts.has(displayed.length))
					.forEach((displayed) => uniqueDigitCount++);
			});
			return uniqueDigitCount;
		},
		(readings) => {
			let sum = 0;
			readings.forEach(
				(reading) =>
					(sum += parseInt(
						reading.displayed
							.map((displayed) => reading.digitToNumber[displayed.toString()])
							.map((n) => `${n}`)
							.join(""),
					)),
			);
			return sum;
		},
	],
);
