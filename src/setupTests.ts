import {
  INumeralSystem,
  NumeralSystem10,
  NumeralSystem36,
  NumeralSystem64,
} from "./index";

const NUMERAL_SYSTEM_CLASSES = [
  NumeralSystem10,
  NumeralSystem36,
  NumeralSystem64,
];
export const NUMERAL_SYSTEMS: INumeralSystem[] = NUMERAL_SYSTEM_CLASSES.map(
  (cls) => new cls(),
);
