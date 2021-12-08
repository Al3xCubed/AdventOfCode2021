import { Day } from "./ADay.ts";

type Bit = 1 | 0;
type Word = Bit[];

function mostCommonBit(pos: number, words: Word[]): Bit {
	return words.filter((word) => word[pos] === 1).length >= words.length / 2 ? 1 : 0;
}

function wordToInt(word: Word) {
	return Number.parseInt(word.join(""), 2);
}

function oxygenCriteria(bitIndex: number, words: Word[]) {
	const bit: Bit = mostCommonBit(bitIndex, words);
	return words.filter((word) => word[bitIndex] === bit);
}

function co2Criteria(bitIndex: number, words: Word[]) {
	const bit: Bit = mostCommonBit(bitIndex, words) === 1 ? 0 : 1;
	return words.filter((word) => word[bitIndex] === bit);
}

export const DAY3 = new Day(
	3,
	(str) => {
		const words = str.split("\n").map(
			(number) =>
				number
					.split("")
					.filter((bit) => bit === "1" || bit === "0")
					.map((bit) => parseInt(bit) as Bit) as Word,
		);
		const wordLength = words[0].length;
		return { words, wordLength };
	},
	[
		(data) => {
			const gammaRateWord: (1 | 0)[] = [];
			for (let i = 0; i < data.wordLength; i++) {
				gammaRateWord.push(mostCommonBit(i, data.words));
			}
			const epsilonRateWord = gammaRateWord.map((bit) => (bit === 1 ? 0 : 1));

			const gammaRate = wordToInt(gammaRateWord);
			const epsilonRate = wordToInt(epsilonRateWord);
			return gammaRate * epsilonRate;
		},
		(data) => {
			let oxygenData = data.words;
			for (let i = 0; i < data.wordLength; i++) {
				oxygenData = oxygenCriteria(i, oxygenData);
				if (oxygenData.length === 1) break;
			}
			const oxygenGeneratorRating = wordToInt(oxygenData[0]);

			let co2Data = data.words;
			for (let i = 0; i < data.wordLength; i++) {
				co2Data = co2Criteria(i, co2Data);
				if (co2Data.length === 1) break;
			}
			const co2ScrubberRating = wordToInt(co2Data[0]);
			return oxygenGeneratorRating * co2ScrubberRating;
		},
	],
);
