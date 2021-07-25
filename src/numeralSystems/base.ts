import { INumeralSystem } from "./interface";

export abstract class BaseNumeralSystem implements INumeralSystem {
  abstract readonly CHARS: string[];

  get base(): number {
    return this.CHARS.length;
  }

  get positiveChar(): string {
    return "+";
  }

  get negativeChar(): string {
    return "-";
  }

  get radixPointChar(): string {
    return ":";
  }

  abstract toChar(var1: number): string;

  abstract toDigit(var1: string): number;
}
