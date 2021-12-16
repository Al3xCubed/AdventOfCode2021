import "./utils.ts";
import { Day } from "./ADay.ts";

const hexToBin: { [hex: string]: string } = {
	"0": "0000",
	"1": "0001",
	"2": "0010",
	"3": "0011",
	"4": "0100",
	"5": "0101",
	"6": "0110",
	"7": "0111",
	"8": "1000",
	"9": "1001",
	A: "1010",
	B: "1011",
	C: "1100",
	D: "1101",
	E: "1110",
	F: "1111",
};

abstract class APacketReader {
	public abstract isPacketType(type: number): boolean;
	public abstract read(reader: Reader, packetVersion: number): APacket;
}

abstract class APacket {
	public constructor(public readonly packetVersion: number) {}
}

class OperatorPacket extends APacket {
	public constructor(packetVersion: number, public readonly subpackets: APacket[]) {
		super(packetVersion);
	}
}

class OperatorPacketReader extends APacketReader {
	public read(reader: Reader, packetVersion: number): OperatorPacket {
		const lengthTypeID = reader.readInt(1);
		const subPackets: APacket[] = [];
		if (lengthTypeID === 0) {
			const totalLengthInBits = reader.readInt(15);
			let bitsRead = 0;
			while (bitsRead < totalLengthInBits) {
				const startPos = reader.pointer;
				subPackets.push(reader.readPacket());
				const endPos = reader.pointer;
				const length = endPos - startPos;
				bitsRead += length;
			}
		} else {
			const numberOfSubPackets = reader.readInt(11);
			for (let i = 0; i < numberOfSubPackets; i++) {
				subPackets.push(reader.readPacket());
			}
		}

		return new OperatorPacket(packetVersion, subPackets);
	}

	public isPacketType(type: number): boolean {
		return type !== 4;
	}
}

class LiteralValuePacket extends APacket {
	public constructor(packetVersion: number, public readonly value: number) {
		super(packetVersion);
	}
}

class LiteralValuePacketReader extends APacketReader {
	public read(reader: Reader, packetVersion: number): LiteralValuePacket {
		let valueBits = "";
		while (true) {
			let bitsPart = reader.read(5);
			valueBits += bitsPart.substr(1);
			if (bitsPart[0] === "0") break;
		}

		const value = Number.parseInt(valueBits, 2);
		return new LiteralValuePacket(packetVersion, value);
	}

	public isPacketType(type: number): boolean {
		return type === 4;
	}
}

class Reader {
	public pointer: number;

	private static readonly readers: APacketReader[] = [
		new OperatorPacketReader(),
		new LiteralValuePacketReader(),
	];

	public constructor(public readonly data: Data) {
		this.pointer = 0;
	}

	public readPacket(): APacket {
		const packetVersion = this.readInt(3);
		const packetTypeId = this.readInt(3);
		return Reader.readers
			.find((reader) => reader.isPacketType(packetTypeId))!
			.read(this, packetVersion);
	}

	public readInt(length: number): number {
		return Number.parseInt(this.read(length), 2);
	}

	public read(length: number): string {
		const str = this.data.binString.substr(this.pointer, length);
		this.pointer += length;
		return str;
	}
}

class Data {
	public hexString: string;
	public binString: string;

	public constructor(hexString: string) {
		this.hexString = hexString;
		this.binString = hexString
			.split("")
			.map((hex) => hexToBin[hex])
			.join("");
	}
}

export const DAY16 = new Day(16, (input) => new Data(input), [
	(data) => {
		const packet = new Reader(data).readPacket();
		function forEachPacket(packet: APacket, fn: (packet: APacket) => void) {
			fn(packet);
			if (packet instanceof OperatorPacket) {
				packet.subpackets.forEach((subPacket) => forEachPacket(subPacket, fn));
			}
		}
		let sum = 0;
		forEachPacket(packet, (packet) => (sum += packet.packetVersion));
		return sum;
	},
]);
