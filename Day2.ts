import { Day } from "./ADay.ts";

export const DAY2 = new Day(
	2,
	(str) =>
		str.split("\n").map((str) => {
			const [step, count] = str.split(" ");
			return [step, Number.parseInt(count)] as [string, number];
		}),
	[
		(data) => {
			let horizontal = 0;
			let depth = 0;
			data.forEach((step) => {
				switch (step[0]) {
					case "forward": {
						horizontal += step[1];
						break;
					}
					case "down": {
						depth += step[1];
						break;
					}
					case "up": {
						depth -= step[1];
						break;
					}
				}
			});
			return horizontal * depth;
		},
		(data) => {
			let horizontal = 0;
			let depth = 0;
			let aim = 0;
			data.forEach((step) => {
				switch (step[0]) {
					case "forward": {
						horizontal += step[1];
						depth += aim * step[1];
						break;
					}
					case "down": {
						aim += step[1];
						break;
					}
					case "up": {
						aim -= step[1];
						break;
					}
				}
			});
			return horizontal * depth;
		},
	],
);
