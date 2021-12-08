export class Day<T> {
	public day: number;
	public parts: ((data: T) => unknown)[];
	private dataPreProcessor: (input: string) => T;
	public data: T;

	public constructor(
		day: number,
		dataPreProcessor: (input: string) => T,
		parts: ((data: T) => unknown)[],
	) {
		this.day = day;
		this.parts = parts;
		this.dataPreProcessor = dataPreProcessor;
		this.data = this.dataPreProcessor(Deno.readTextFileSync(`./data/day${this.day}.txt`));
	}

	public solve() {
		console.log(`==[ DAY ${this.day} ]==`);
		this.parts.forEach((part, index) => console.log(`Part ${index + 1}`, part(this.data)));
	}
}
