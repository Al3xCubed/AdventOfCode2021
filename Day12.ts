import "./utils.ts";
import { Day } from "./ADay.ts";
import { Graph } from "./utils.ts";

export const DAY12 = new Day(
	12,
	(input) => {
		const edges = input.split("\n").map((edge) => edge.split("-") as [string, string]);
		const nodes = edges.flatMap((edge) => edge).distinct();
		return new Graph<string>(nodes, edges);
	},
	[
		(graph) =>
			graph.getDistinctPaths("start", "end", (node, pathSoFar) =>
				node.toLowerCase() === node ? !pathSoFar.includes(node) : true,
			).length,
		(graph) =>
			graph.getDistinctPaths("start", "end", (node, pathSoFar) => {
				if (node === "start" || node === "end") {
					if (pathSoFar.includes(node)) return false;
				}
				if (node.toLowerCase() !== node) return true;
				if (!pathSoFar.includes(node)) return true;

				const onlySmalls = pathSoFar.filter((node) => node.toLowerCase() === node);
				const double = onlySmalls.find((node, index) => onlySmalls.indexOf(node) !== index);
				if (double == undefined) return true;
				return false;
			}).length,
	],
);
