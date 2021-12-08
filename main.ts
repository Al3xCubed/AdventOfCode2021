import { Day } from "./ADay.ts";
import { DAY1 } from "./Day1.ts";
import { DAY2 } from "./Day2.ts";
import { DAY3 } from "./Day3.ts";
import { DAY4 } from "./Day4.ts";
import { DAY5 } from "./Day5.ts";
import { DAY6 } from "./Day6.ts";
import { DAY7 } from "./Day7.ts";
import { DAY8 } from "./Day8.ts";

const days: Day<any>[] = [/* DAY1, DAY2, DAY3, DAY4, DAY5, DAY6, DAY7 */ DAY5];
days.forEach((day) => day.solve());