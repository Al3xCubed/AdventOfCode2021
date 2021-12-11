export class Day<T> {
	public day: number;
	public parts: ((data: T) => unknown)[];
	private dataPreProcessor: (input: string) => T;
	private resetData: boolean;
	public data: T;

	public constructor(
		day: number,
		dataPreProcessor: (input: string) => T,
		parts: ((data: T) => unknown)[],
		resetData: boolean = false,
	) {
		this.day = day;
		this.parts = parts;
		this.dataPreProcessor = dataPreProcessor;
		this.data = this.parseInput();
		this.resetData = resetData;
	}

	private parseInput() {
		return this.dataPreProcessor(Deno.readTextFileSync(`./data/day${this.day}.txt`));
	}

	public solve() {
		console.log(`==[ DAY ${this.day} ]==`);
		this.parts.forEach((part, index) =>
			console.log(`Part ${index + 1}`, part(this.resetData ? this.parseInput() : this.data)),
		);
	}
}
