import { ILexoNumeralSystem } from "./lexoNumeralSystem";

export class LexoNumeralSystem36 implements ILexoNumeralSystem {
  private DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz".split("");

  getBase(): number {
    return 36;
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

    if (char >= "a" && char <= "z") {
      return char.charCodeAt(0) - 97 + 10;
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
