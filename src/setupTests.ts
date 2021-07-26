import {
  INumeralSystem,
  NumeralSystem10,
  NumeralSystem36,
  NumeralSystem64,
} from "./index";

interface TestCase {
  system: INumeralSystem;
  base: number;
}

const NUMERAL_SYSTEM_CLASSES = {
  10: NumeralSystem10,
  36: NumeralSystem36,
  64: NumeralSystem64,
};

export const getTestCases = (bases = [10, 36, 64]): TestCase[] => {
  return bases.map((base) => {
    const cls = NUMERAL_SYSTEM_CLASSES[base];
    const system = new cls();

    return {
      system,
      base,
    };
  });
};
