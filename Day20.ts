import "./utils.ts";
import { Day } from "./ADay.ts";
import { Grid, Range, to2DArray } from "./utils.ts";

class Pixel {
	public constructor(public lit: boolean) {}

	public toString() {
		return this.lit ? "#" : ".";
	}
}

class Image extends Grid<Pixel> {
	private static readonly margin = 3;
	private xRange: Range;
	private yRange: Range;

	public constructor(
		width: number,
		height: number,
		pixels: Pixel[],
		areInfitePixelsLit: boolean,
	) {
		super(width + 2 * Image.margin, height + 2 * Image.margin, [
			...Array(Image.margin)
				.fill(Array(width + 2 * Image.margin).fill(new Pixel(areInfitePixelsLit)))
				.flatMap((p) => p),
			...to2DArray(pixels, width).flatMap((row) => [
				...Array(Image.margin).fill(new Pixel(areInfitePixelsLit)),
				...row,
				...Array(Image.margin).fill(new Pixel(areInfitePixelsLit)),
			]),
			...Array(Image.margin)
				.fill(Array(width + 2 * Image.margin).fill(new Pixel(areInfitePixelsLit)))
				.flatMap((p) => p),
		]);

		this.xRange = new Range(Image.margin, Image.margin + width - 1);
		this.yRange = new Range(Image.margin, Image.margin + height - 1);
	}

	public get numberOfLitPixels() {
		return this.values.count((pixel) => pixel.lit);
	}

	public enhance(filter: Filter) {
		const areInfitePixelsLit = this.enhancePixel(1, 1, filter);

		const r = Math.floor(Image.margin / 2);

		const enhanced: Pixel[] = [];

		for (let y = this.yRange.min - r; y <= this.yRange.max + r; y++) {
			for (let x = this.xRange.min - r; x <= this.xRange.max + r; x++) {
				const lit = this.enhancePixel(x, y, filter);
				enhanced.push(new Pixel(lit));
			}
		}
		const newWidth = this.xRange.length + 2 * r;
		const newHeight = this.yRange.length + 2 * r;
		const enhancedImage = new Image(newWidth, newHeight, enhanced, areInfitePixelsLit);
		return enhancedImage;
	}

	private enhancePixel(x: number, y: number, filter: Filter) {
		const area = [
			this.getLitForPixel(x - 1, y - 1),
			this.getLitForPixel(x, y - 1),
			this.getLitForPixel(x + 1, y - 1),
			this.getLitForPixel(x - 1, y),
			this.getLitForPixel(x, y),
			this.getLitForPixel(x + 1, y),
			this.getLitForPixel(x - 1, y + 1),
			this.getLitForPixel(x, y + 1),
			this.getLitForPixel(x + 1, y + 1),
		];
		const index = parseInt(area.join(""), 2);
		return filter.isLit(index);
	}

	private getLitForPixel(x: number, y: number) {
		return this.get(x, y).lit ? "1" : "0";
	}
}

class Filter {
	private filter: string;

	public constructor(filter: string) {
		this.filter = filter;
	}

	public isLit(index: number) {
		return this.filter[index] === "#";
	}
}

export const DAY20 = new Day(
	20,
	(input) => {
		const [filterStr, imageStr] = input.split("\n\n");
		const rows = imageStr.split("\n");
		const width = rows[0].length;
		const height = rows.length;
		const pixels = rows.flatMap((row) => row.split("").map((p) => new Pixel(p === "#")));

		return { filter: new Filter(filterStr), image: new Image(width, height, pixels, false) };
	},
	[
		({ filter, image }) => {
			const enhanced1 = image.enhance(filter);
			const enhanced2 = enhanced1.enhance(filter);
			return enhanced2.numberOfLitPixels;
		},
	],
);
