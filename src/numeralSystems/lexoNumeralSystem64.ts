import { ILexoNumeralSystem } from "./lexoNumeralSystem";

export class LexoNumeralSystem64 implements ILexoNumeralSystem {
  private DIGITS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz".split(
      "",
    );

  getBase(): number {
    return 64;
  }

  getPositiveChar(): string {
    return "+";
  }

  getNegativeChar(): string {
    return "-";
  }

  getRadixPointChar(): string {
    return ":";
  }

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
    if (digit >= 0 && digit < this.getBase()) {
      return this.DIGITS[digit];
    }

    throw new Error(`Not a valid digit: ${digit}`);
  }
}
