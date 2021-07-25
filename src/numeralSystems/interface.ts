export interface INumeralSystem {
  readonly CHARS: string[];

  getBase(): number;

  getPositiveChar(): string;

  getNegativeChar(): string;

  getRadixPointChar(): string;

  toDigit(var1: string): number;

  toChar(var1: number): string;
}
