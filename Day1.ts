import { Day } from "./ADay.ts";

export const DAY1 = new Day(1, (str) => str.split("\n").map((str) => Number.parseInt(str)), [
	(numbers) => {
		let increasements = 0;
		for (let i = 1; i < numbers.length; i++) {
			if (numbers[i] > numbers[i - 1]) increasements++;
		}
		return increasements;
	},
	(numbers) => {
		let slidingIncreasements = 0;
		for (let i = 1; i < numbers.length - 2; i++) {
			let a = numbers[i - 1];
			let b = numbers[i + 2];
			if (b > a) slidingIncreasements++;
		}
		return slidingIncreasements;
	},
]);
