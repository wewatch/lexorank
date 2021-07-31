import { getTestCases } from "../setupTests";
import { LexoDecimal } from "./lexoDecimal";
import { LexoInteger } from "./lexoInteger";

test.each(getTestCases())("Parse base $base", ({ system }) => {
  const radixPointChar = system.radixPointChar;

  expect(() =>
    LexoDecimal.parse(radixPointChar + radixPointChar, system),
  ).toThrow(`More than one ${radixPointChar}`);

  const intString = "42";
  const int = LexoInteger.parse(intString, system);
  expect(LexoDecimal.parse(intString, system)).toEqual(LexoDecimal.from(int));
  expect(LexoDecimal.make(int.shiftLeft(2), 2)).toEqual(LexoDecimal.from(int));
});

test.each(getTestCases([10]))("Arithmetics base $base", ({ system, base }) => {
  const toString = (num: number) =>
    num.toString(base).replace(".", system.radixPointChar);
  const _ = (num: number) =>
    LexoDecimal.parse(toString(Number(num.toFixed(2))), system);

  expect(LexoDecimal.half(system)).toEqual(_(0.5));

  const nums = [4.2, 31.4, -1.9, 42];
  const lexoDecimals = nums.map(_);

  function* generatePairs() {
    for (let i = 0; i < nums.length; ++i) {
      for (let j = 0; j < nums.length; ++j) {
        yield [nums[i], lexoDecimals[i], nums[j], lexoDecimals[j]] as const;
      }
    }
  }

  // Add
  for (const [x, lexoX, y, lexoY] of generatePairs()) {
    expect(lexoX.add(lexoY)).toEqual(_(x + y));
  }

  // Subtract
  for (const [x, lexoX, y, lexoY] of generatePairs()) {
    expect(lexoX.subtract(lexoY)).toEqual(_(x - y));
  }

  // Multiply
  for (const [x, lexoX, y, lexoY] of generatePairs()) {
    expect(lexoX.multiply(lexoY)).toEqual(_(x * y));
  }
});
