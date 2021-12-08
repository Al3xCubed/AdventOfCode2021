import { Day } from "./ADay.ts";

function slow(data: number[], totalDays: number) {
	let fishes = [...data];
	for (let i = 0; i < totalDays; i++) {
		fishes = fishes.flatMap((fish) => {
			if (fish === 0) return [6, 8];
			return [fish - 1];
		});
	}

	return fishes.length;
}

function fast(data: number[], totalDays: number) {
	const fishes: { [fish: number]: number } = {};
	for (let i = 0; i < 9; i++) {
		fishes[i] = data.filter((fish) => fish === i).length;
	}
	for (let day = 0; day < totalDays; day++) {
		const zeroFishes = fishes[0];
		for (let i = 0; i < 8; i++) fishes[i] = fishes[i + 1];
		fishes[8] = zeroFishes;
		fishes[6] += zeroFishes;
	}
	return Object.values(fishes).reduce((prev, curr) => prev + curr, 0);
}

export const DAY6 = new Day(6, (input) => input.split(",").map((n) => parseInt(n)), [
	(data) => fast(data, 80),
	(data) => fast(data, 256),
]);
