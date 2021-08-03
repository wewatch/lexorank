import { LexoRankError } from "../error";
import { BaseNumeralSystem } from "./base";

export class NumeralSystem10 extends BaseNumeralSystem {
  readonly CHARS = "0123456789".split("");

  get radixPointChar(): string {
    return ".";
  }

  toDigit(char: string): number {
    if (char >= "0" && char <= "9") {
      return char.charCodeAt(0) - 48;
    }

    throw new LexoRankError(`Not a valid char: ${char}`);
  }

  toChar(digit: number): string {
    if (digit >= 0 && digit < this.base) {
      return String.fromCharCode(digit + 48);
    }

    throw new LexoRankError(`Not a valid digit: ${digit}`);
  }
}
