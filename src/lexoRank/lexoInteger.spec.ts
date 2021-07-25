import { NumeralSystem10, NumeralSystem36 } from "../numeralSystems";
import { NUMERAL_SYSTEMS } from "../setupTests";
import { LexoInteger } from "./lexoInteger";

test("Special values", () => {
  for (const system of NUMERAL_SYSTEMS) {
    const zero = LexoInteger.zero(system);
    expect(zero.isZero()).toEqual(true);
    expect(zero.isOne()).toEqual(false);

    const one = LexoInteger.one(system);
    expect(one.isOne()).toEqual(true);
    expect(one.isZero()).toEqual(false);
  }
});

test("Parse", () => {
  for (const system of NUMERAL_SYSTEMS) {
    let parsed = LexoInteger.parse("42", system);
    expect(parsed).toEqual(LexoInteger.make(system, 1, [2, 4]));

    parsed = LexoInteger.parse("+42", system);
    expect(parsed).toEqual(LexoInteger.make(system, 1, [2, 4]));

    parsed = LexoInteger.parse("-42", system);
    expect(parsed).toEqual(LexoInteger.make(system, -1, [2, 4]));

    expect(() => {
      LexoInteger.parse("?", system);
    }).toThrow("Not a valid char: ?");
  }
});

test("Arithmetics", () => {
  for (const systemCls of [NumeralSystem10, NumeralSystem36]) {
    const system = new systemCls();
    const base = system.base;

    const _ = (num: number) => LexoInteger.parse(num.toString(base), system);

    const firstNumber = 42;
    const first = _(firstNumber);

    const secondNumber = 314;
    const second = _(secondNumber);

    const thirdNumber = -19;
    const third = _(thirdNumber);

    const zero = LexoInteger.zero(system);
    const one = LexoInteger.one(system);
    const minusOne = _(-1);

    // Add
    expect(first.add(zero)).toEqual(first);
    expect(zero.add(first)).toEqual(first);

    expect(first.add(second)).toEqual(_(firstNumber + secondNumber));

    expect(first.add(third)).toEqual(_(firstNumber + thirdNumber));
    expect(third.add(first)).toEqual(_(firstNumber + thirdNumber));

    // Subtract
    expect(zero.subtract(first)).toEqual(_(-firstNumber));
    expect(first.subtract(zero)).toEqual(first);
    expect(first.subtract(first)).toEqual(zero);

    expect(first.subtract(third)).toEqual(_(firstNumber - thirdNumber));
    expect(third.subtract(first)).toEqual(_(thirdNumber - firstNumber));

    // Multiply
    expect(zero.multiply(first)).toEqual(zero);
    expect(first.multiply(zero)).toEqual(zero);

    expect(one.multiply(first)).toEqual(first);
    expect(first.multiply(one)).toEqual(first);

    expect(minusOne.multiply(first)).toEqual(_(-firstNumber));
    expect(first.multiply(minusOne)).toEqual(_(-firstNumber));

    expect(first.multiply(third)).toEqual(_(firstNumber * thirdNumber));

    // Negate
    expect(zero.negate()).toEqual(zero);
    expect(one.negate()).toEqual(minusOne);

    // Compare
    expect(first.compareTo(first)).toEqual(0);

    expect(third.compareTo(third)).toEqual(0);
    expect(third.compareTo(first)).toEqual(-1);
    expect(first.compareTo(third)).toEqual(1);

    expect(third.compareTo(_(-firstNumber))).toEqual(1);
    expect(_(-firstNumber).compareTo(third)).toEqual(-1);

    // Format
    for (const [int, num] of [
      [first, firstNumber] as const,
      [third, thirdNumber] as const,
    ]) {
      expect(int.format()).toEqual(num.toString(base));
      expect(`${int}`).toEqual(num.toString(base));
    }

    // Equals
    expect(first.equals(first)).toEqual(true);
  }
});
