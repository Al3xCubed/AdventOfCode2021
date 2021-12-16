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
	public abstract read(reader: Reader, packetVersion: number, packetTypeId: number): APacket;
}

abstract class APacket {
	public constructor(public readonly packetVersion: number) {}

	public abstract evaluate(): number;
}

abstract class AOperatorPacket extends APacket {
	public constructor(packetVersion: number, public readonly subpackets: APacket[]) {
		super(packetVersion);
	}
}

class SumOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		return this.subpackets.map((subpacket) => subpacket.evaluate()).sum();
	}
}

class ProductOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		return this.subpackets.map((subpacket) => subpacket.evaluate()).product();
	}
}

class MinimumOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		return Math.min(...this.subpackets.map((subpacket) => subpacket.evaluate()));
	}
}

class MaximumOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		return Math.max(...this.subpackets.map((subpacket) => subpacket.evaluate()));
	}
}

class GreaterThanOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		if (this.subpackets[0].evaluate() > this.subpackets[1].evaluate()) return 1;
		else return 0;
	}
}

class LessThanOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		if (this.subpackets[0].evaluate() < this.subpackets[1].evaluate()) return 1;
		else return 0;
	}
}

class EqualToOperatorPacket extends AOperatorPacket {
	public evaluate(): number {
		if (this.subpackets[0].evaluate() === this.subpackets[1].evaluate()) return 1;
		else return 0;
	}
}

class OperatorPacketReader extends APacketReader {
	public read(reader: Reader, packetVersion: number, packetTypeId: number): AOperatorPacket {
		const lengthTypeID = reader.readInt(1);
		const subpackets: APacket[] = [];
		if (lengthTypeID === 0) {
			const totalLengthInBits = reader.readInt(15);
			let bitsRead = 0;
			while (bitsRead < totalLengthInBits) {
				const startPos = reader.pointer;
				subpackets.push(reader.readPacket());
				const endPos = reader.pointer;
				const length = endPos - startPos;
				bitsRead += length;
			}
		} else {
			const numberOfSubPackets = reader.readInt(11);
			for (let i = 0; i < numberOfSubPackets; i++) {
				subpackets.push(reader.readPacket());
			}
		}

		switch (packetTypeId) {
			case 0:
				return new SumOperatorPacket(packetVersion, subpackets);
			case 1:
				return new ProductOperatorPacket(packetVersion, subpackets);
			case 2:
				return new MinimumOperatorPacket(packetVersion, subpackets);
			case 3:
				return new MaximumOperatorPacket(packetVersion, subpackets);
			case 5:
				return new GreaterThanOperatorPacket(packetVersion, subpackets);
			case 6:
				return new LessThanOperatorPacket(packetVersion, subpackets);
			case 7:
				return new EqualToOperatorPacket(packetVersion, subpackets);
			default:
				throw new Error(`Packet type id '${packetTypeId}' is unknown`);
		}
	}

	public isPacketType(type: number): boolean {
		return type !== 4;
	}
}

class LiteralValuePacket extends APacket {
	public constructor(packetVersion: number, public readonly value: number) {
		super(packetVersion);
	}

	public evaluate(): number {
		return this.value;
	}
}

class LiteralValuePacketReader extends APacketReader {
	public read(reader: Reader, packetVersion: number, packetTypeId: number): LiteralValuePacket {
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
			.read(this, packetVersion, packetTypeId);
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
			if (packet instanceof AOperatorPacket) {
				packet.subpackets.forEach((subpacket) => forEachPacket(subpacket, fn));
			}
		}
		let sum = 0;
		forEachPacket(packet, (packet) => (sum += packet.packetVersion));
		return sum;
	},
	(data) => new Reader(data).readPacket().evaluate(),
]);
