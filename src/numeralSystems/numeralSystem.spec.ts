import { NUMERAL_SYSTEMS } from "../setupTests";

describe("Numeral Systems", () => {
  it("toDigit and toChar are the inverse of each other", () => {
    for (const system of NUMERAL_SYSTEMS) {
      for (const char of system.CHARS) {
        expect(system.toChar(system.toDigit(char))).toEqual(char);
      }
    }
  });

  it("throws an error for invalid digit", () => {
    for (const system of NUMERAL_SYSTEMS) {
      const base = system.base;

      expect(() => {
        system.toChar(base);
      }).toThrow(`Not a valid digit: ${base}`);
    }
  });

  it("throws an error for invalid char", () => {
    for (const system of NUMERAL_SYSTEMS) {
      const invalidChar = "?";

      expect(() => {
        system.toDigit(invalidChar);
      }).toThrow(`Not a valid char: ${invalidChar}`);
    }
  });
});
