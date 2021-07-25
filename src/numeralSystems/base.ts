import { INumeralSystem } from "./interface";

export abstract class BaseNumeralSystem implements INumeralSystem {
  abstract readonly CHARS: string[];

  getBase(): number {
    return this.CHARS.length;
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

  abstract toChar(var1: number): string;

  abstract toDigit(var1: string): number;
}
