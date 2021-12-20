import "./utils.ts";
import { Day } from "./ADay.ts";
import { degToRad, Matrix3x3, Vector3 } from "./utils.ts";

type OverlapData = [Vector3, Vector3];

const overlapThreshold = 12;

const angles = [0, 90, 180, 270].map((deg) => degToRad(deg));
const xRots = angles.map((angle) => Matrix3x3.rotationMatrixX(angle));
const yRots = angles.map((angle) => Matrix3x3.rotationMatrixY(angle));
const zRots = angles.map((angle) => Matrix3x3.rotationMatrixZ(angle));
const transformations = xRots
	.flatMap((xRot) => yRots.map((yRot) => [xRot, yRot] as [Matrix3x3, Matrix3x3])) // zip with yRots
	.flatMap(([xRot, yRot]) =>
		zRots.map((zRot) => [xRot, yRot, zRot] as [Matrix3x3, Matrix3x3, Matrix3x3]),
	) // zip with zRots
	.map((combination) => combination.reduce((prev, curr) => Matrix3x3.mult(prev, curr))) // make combinations into single matrix
	.distinct((a, b) => a.equals(b)); // remove duplicates

class Direction {
	public readonly directions: Vector3[];

	public constructor(public readonly fromOffset: Vector3, public readonly toOffset: Vector3) {
		const direction = Vector3.sub(toOffset, fromOffset);
		this.directions = transformations.map((transformation) =>
			Matrix3x3.mult(transformation, direction),
		);
	}
}

class Scanner {
	public readonly directions: Direction[];

	public position?: Vector3;

	public constructor(public id: number, public offsets: Vector3[]) {
		this.directions = [];
		this.position = undefined;

		for (const fromOffset of offsets) {
			for (const toOffset of offsets) {
				if (toOffset === fromOffset) continue;

				this.directions.push(new Direction(fromOffset, toOffset));
			}
		}
	}

	public static identifyScannerTransformsByOverlaps(scanners: Scanner[]) {
		const firstScanner = scanners[0];
		firstScanner.position = Vector3.zero;
		const positionedScanners = [firstScanner];
		const unpositionedScanners = [...scanners.slice(1)];
		while (unpositionedScanners.length > 0) {
			console.log(unpositionedScanners.length);

			let newlyPositionedScanner: Scanner | undefined = undefined;

			for (const scanner1 of positionedScanners) {
				if (newlyPositionedScanner != undefined) break;

				for (const scanner2 of unpositionedScanners) {
					if (newlyPositionedScanner != undefined) break;

					for (let transformVariant = 0; transformVariant < 24; transformVariant++) {
						const dirs1 = scanner1.directions.map((dir) => ({
							offset: dir.fromOffset,
							dir: dir.directions[0],
						}));
						const dirs2 = scanner2.directions.map((dir) => ({
							offset: dir.fromOffset,
							dir: dir.directions[transformVariant],
						}));
						const overlaps = dirs1
							.map((dir1) => ({
								dir1,
								dir2s: dirs2.filter((dir2) => dir2.dir.equals(dir1.dir)),
							}))
							.filter((matches) => matches.dir2s.length > 0)
							.flatMap((matches) =>
								matches.dir2s.map(
									(dir2) => [matches.dir1.offset, dir2.offset] as OverlapData,
								),
							)
							.distinct((a, b) => a[0].equals(b[0]) && a[1].equals(b[1]));

						if (overlaps.length >= overlapThreshold) {
							scanner2.reorient(scanner1, overlaps[0]);
							newlyPositionedScanner = scanner2;
							break;
						}
					}
				}
			}

			positionedScanners.push(newlyPositionedScanner!);
			unpositionedScanners.remove(newlyPositionedScanner!);
		}
	}

	private reorient(origin: Scanner, overlap: OverlapData) {
		// find required transformation to match the origin's rotation
		for (const transformation of transformations) {
			const offset = Vector3.sub(overlap[0], Matrix3x3.mult(transformation, overlap[1]));

			const transformedOffsets = this.offsets
				.map((offset) => Matrix3x3.mult(transformation, offset)) // apply rotation
				.map((v) => v.add(offset));

			const overlapCount = transformedOffsets.reduce(
				(prev, curr) =>
					prev +
					(origin.offsets.some((originOffset) => originOffset.equals(curr)) ? 1 : 0),
				0,
			);

			// found the correct rotation
			if (overlapCount >= overlapThreshold) {
				this.offsets.map((offset, index) => offset.set(transformedOffsets[index]));
				this.position = offset;
				return;
			}
		}

		throw new Error("Rotation should have been found");
	}

	public static parse(input: string) {
		const lines = input.split("\n");
		const id = parseInt(lines.splice(0, 1)[0].match(/--- scanner ([0-9]+) ---/)![1]);
		const offsets: Vector3[] = lines.map((line) => {
			const [x, y, z] = line.split(",").map((n) => parseInt(n));
			return new Vector3(x, y, z);
		});
		return new Scanner(id, offsets);
	}
}

export const DAY19 = new Day(
	19,
	(input) => {
		return input.split("\n\n").map((str) => Scanner.parse(str));
	},
	[
		(scanners) => {
			Scanner.identifyScannerTransformsByOverlaps(scanners);
			const beaconPositions: Set<string> = new Set();
			scanners.forEach((scanner) =>
				scanner.offsets.forEach((offset) => beaconPositions.add(offset.toString())),
			);
			return beaconPositions.size;
		},
	],
);
