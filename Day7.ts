import { Day } from "./ADay.ts";

function calculateFuelCostP1(positions: number[], pos: number) {
	return positions.map((p) => Math.abs(pos - p)).reduce((prev, curr) => prev + curr, 0);
}

function calculateFuelCostP2(positions: number[], pos: number) {
	return positions
		.map((p) => {
			const steps = Math.abs(pos - p);
			const cost = (steps * (steps + 1)) / 2;
			return cost;
		})
		.reduce((prev, curr) => prev + curr, 0);
}

function findOptimum(
	positions: number[],
	costCalculator: (positions: number[], pos: number) => number,
) {
	const min = Math.min(...positions);
	const max = Math.max(...positions);
	const range = max - min;
	let current = Math.round((max + min) / 2);
	let currCount = costCalculator(positions, current);
	let oldCurrent = 0;
	// console.log({ current });
	let i = 0;
	while (true) {
		// console.log(`iter ${i++},${oldCurrent}, ${current}`);

		const prev = costCalculator(positions, current - 1);
		const next = costCalculator(positions, current + 1);
		if (prev < currCount) {
			oldCurrent = current;
			current--;
			currCount = prev;
		} else if (next < currCount) {
			oldCurrent = current;
			current++;
			currCount = next;
		} else break;
	}
	return current;
}

export const DAY7 = new Day(
	7,
	(input) => {
		return input.split(",").map((n) => parseInt(n));
	},
	[
		(data) => calculateFuelCostP1(data, findOptimum(data, calculateFuelCostP1)),
		(data) => calculateFuelCostP2(data, findOptimum(data, calculateFuelCostP2)),
	],
);
