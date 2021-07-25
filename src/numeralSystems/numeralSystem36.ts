import { BaseNumeralSystem } from "./base";

export class NumeralSystem36 extends BaseNumeralSystem {
  readonly CHARS = "0123456789abcdefghijklmnopqrstuvwxyz".split("");

  toDigit(char: string): number {
    if (char >= "0" && char <= "9") {
      return char.charCodeAt(0) - 48;
    }

    if (char >= "a" && char <= "z") {
      return char.charCodeAt(0) - 97 + 10;
    }

    throw new Error(`Not a valid char: ${char}`);
  }

  toChar(digit: number): string {
    if (digit >= 0 && digit < this.getBase()) {
      return this.CHARS[digit];
    }

    throw new Error(`Not a valid digit: ${digit}`);
  }
}
