import {
  INumeralSystem,
  NumeralSystem10,
  NumeralSystem36,
  NumeralSystem64,
} from "./index";

const CLASSES = [NumeralSystem10, NumeralSystem36, NumeralSystem64];
const INSTANCES: INumeralSystem[] = CLASSES.map((cls) => new cls());

describe("Numeral Systems", () => {
  it("toDigit and toChar are the inverse of each other", () => {
    for (const instance of INSTANCES) {
      for (const char of instance.CHARS) {
        expect(instance.toChar(instance.toDigit(char))).toStrictEqual(char);
      }
    }
  });

  it("throws an error for invalid digit", () => {
    for (const instance of INSTANCES) {
      const base = instance.base;

      expect(() => {
        instance.toChar(base);
      }).toThrow(`Not a valid digit: ${base}`);
    }
  });

  it("throws an error for invalid char", () => {
    for (const instance of INSTANCES) {
      const invalidChar = "?";

      expect(() => {
        instance.toDigit(invalidChar);
      }).toThrow(`Not a valid char: ${invalidChar}`);
    }
  });
});
