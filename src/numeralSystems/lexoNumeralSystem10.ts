import { ILexoNumeralSystem } from "./lexoNumeralSystem";

export class LexoNumeralSystem10 implements ILexoNumeralSystem {
  getBase(): number {
    return 10;
  }

  getPositiveChar(): string {
    return "+";
  }

  getNegativeChar(): string {
    return "-";
  }

  getRadixPointChar(): string {
    return ".";
  }

  toDigit(char: string): number {
    if (char >= "0" && char <= "9") {
      return char.charCodeAt(0) - 48;
    }

    throw new Error(`Not a valid char: ${char}`);
  }

  toChar(digit: number): string {
    if (digit >= 0 && digit < this.getBase()) {
      return String.fromCharCode(digit + 48);
    }

    throw new Error(`Not a valid digit: ${digit}`);
  }
}
