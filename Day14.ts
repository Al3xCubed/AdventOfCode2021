import "./utils.ts";
import { Day } from "./ADay.ts";

class Rule {
	public constructor(public readonly seq: [string, string], public readonly insertion: string) {}
}

class Polymer {
	public constructor(public template: string) {}

	public get counts() {
		const counts: { [char: string]: number } = {};
		for (let i = 0; i < this.template.length; i++) {
			const char = this.template[i];
			if (counts[char] == undefined) counts[char] = 0;
			counts[char]++;
		}
		return counts;
	}

	public applyRules(rules: Rule[]) {
		let newTempl = "";
		for (let i = 0; i < this.template.length - 1; i++) {
			for (const rule of rules) {
				if (rule.seq[0] !== this.template[i] || rule.seq[1] !== this.template[i + 1])
					continue;

				newTempl += this.template[i];
				newTempl += rule.insertion;
				break;
			}
		}
		newTempl += this.template[this.template.length - 1];
		this.template = newTempl;
	}
}

export const DAY14 = new Day(
	14,
	(input) => {
		const [templateStr, rulesStr] = input.split("\n\n");
		const template = new Polymer(templateStr);
		const rules = rulesStr.split("\n").map((rule) => {
			const [seq, insertion] = rule.split(" -> ");
			return new Rule(seq.split("") as [string, string], insertion);
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
	],
);
