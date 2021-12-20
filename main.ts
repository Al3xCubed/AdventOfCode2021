import { Day } from "./ADay.ts";
import { DAY1 } from "./Day1.ts";
import { DAY10 } from "./Day10.ts";
import { DAY11 } from "./Day11.ts";
import { DAY12 } from "./Day12.ts";
import { DAY13 } from "./Day13.ts";
import { DAY14 } from "./Day14.ts";
import { DAY15 } from "./Day15.ts";
import { DAY16 } from "./Day16.ts";
import { DAY17 } from "./Day17.ts";
import { DAY18 } from "./Day18.ts";
import { DAY19 } from "./Day19.ts";
import { DAY2 } from "./Day2.ts";
import { DAY3 } from "./Day3.ts";
import { DAY4 } from "./Day4.ts";
import { DAY5 } from "./Day5.ts";
import { DAY6 } from "./Day6.ts";
import { DAY7 } from "./Day7.ts";
import { DAY8 } from "./Day8.ts";
import { DAY9 } from "./Day9.ts";

const days: Day<any>[] = [
	/* DAY1, DAY2, DAY3, DAY4, DAY5, DAY6, DAY7, DAY8, DAY9, DAY10, DAY11, DAY12, DAY13, DAY14, DAY15, DAY16, DAY17, DAY18, */ DAY19,
];
days.forEach((day) => day.solve());
