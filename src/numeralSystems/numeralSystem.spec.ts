import { getTestCases } from "../setupTests";

describe("Numeral Systems", () => {
  it.each(getTestCases())(
    "toDigit and toChar are the inverse of each other, base $base",
    ({ system }) => {
      for (const char of system.CHARS) {
        expect(system.toChar(system.toDigit(char))).toEqual(char);
      }
    },
  );

  it.each(getTestCases())(
    "throws an error for invalid digit, base $base",
    ({ system }) => {
      const base = system.base;

      expect(() => {
        system.toChar(base);
      }).toThrow(`Not a valid digit: ${base}`);
    },
  );

  it.each(getTestCases())(
    "throws an error for invalid char, base $base",
    ({ system }) => {
      const invalidChar = "?";

      expect(() => {
        system.toDigit(invalidChar);
      }).toThrow(`Not a valid char: ${invalidChar}`);
    },
  );
});
