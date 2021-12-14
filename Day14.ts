import "./utils.ts";
import { Day } from "./ADay.ts";

class Rule {
	public constructor(public readonly pair: string, public readonly insertion: string) {}
}

class Polymer {
	private pairCounts: { [pair: string]: number };

	public constructor(template: string) {
		this.pairCounts = {};
		for (let i = 0; i < template.length - 1; i++) {
			const pair = template.substr(i, 2);
			if (this.pairCounts[pair] == undefined) this.pairCounts[pair] = 0;
			this.pairCounts[pair]++;
		}
	}

	public get counts() {
		const counts: { [char: string]: number } = {};
		Object.entries(this.pairCounts).forEach(([pair, count]) => {
			const [a, b] = pair.split("");
			if (counts[a] == undefined) counts[a] = 0;
			if (counts[b] == undefined) counts[b] = 0;
			counts[a] += count / 2;
			counts[b] += count / 2;
		});
		Object.keys(counts).forEach((char) => (counts[char] = Math.round(counts[char])));
		return counts;
	}

	public applyRules(rules: Rule[]) {
		const newPairCounts: { [pair: string]: number } = {};
		for (const rule of rules) {
			if (this.pairCounts[rule.pair] == undefined) this.pairCounts[rule.pair] = 0;

			const newPairA = `${rule.pair.substr(0, 1)}${rule.insertion}`;
			const newPairB = `${rule.insertion}${rule.pair.substr(1, 1)}`;
			if (newPairCounts[newPairA] == undefined) newPairCounts[newPairA] = 0;
			if (newPairCounts[newPairB] == undefined) newPairCounts[newPairB] = 0;
			newPairCounts[newPairA] += this.pairCounts[rule.pair];
			newPairCounts[newPairB] += this.pairCounts[rule.pair];
		}
		this.pairCounts = newPairCounts;
	}
}

export const DAY14 = new Day(
	14,
	(input) => {
		const [templateStr, rulesStr] = input.split("\n\n");
		const template = new Polymer(templateStr);
		const rules = rulesStr.split("\n").map((rule) => {
			const [seq, insertion] = rule.split(" -> ");
			return new Rule(seq, insertion);
		});
		return { template, rules };
	},
	[
		({ template, rules }) => {
			for (let i = 0; i < 10; i++) {
				template.applyRules(rules);
			}
			const counts = template.counts;
			const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
			return sorted[0][1] - sorted[sorted.length - 1][1];
		},
		({ template, rules }) => {
			for (let i = 0; i < 40; i++) {
				template.applyRules(rules);
			}
			const counts = template.counts;
			const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
			return sorted[0][1] - sorted[sorted.length - 1][1];
		},
	],
	true,
);
