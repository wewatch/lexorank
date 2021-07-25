import { BaseNumeralSystem } from "./base";

export class NumeralSystem64 extends BaseNumeralSystem {
  readonly CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz".split(
      "",
    );

  toDigit(char: string): number {
    if (char >= "0" && char <= "9") {
      return char.charCodeAt(0) - 48;
    }

    if (char >= "A" && char <= "Z") {
      return char.charCodeAt(0) - 65 + 10;
    }

    if (char === "^") {
      return 36;
    }

    if (char === "_") {
      return 37;
    }

    if (char >= "a" && char <= "z") {
      return char.charCodeAt(0) - 97 + 38;
    }

    throw new Error(`Not a valid char: ${char}`);
  }

  toChar(digit: number): string {
    if (digit >= 0 && digit < this.base) {
      return this.CHARS[digit];
    }

    throw new Error(`Not a valid digit: ${digit}`);
  }
}
