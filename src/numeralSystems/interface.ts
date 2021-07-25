export interface INumeralSystem {
  readonly CHARS: string[];

  get base(): number;

  get positiveChar(): string;

  get negativeChar(): string;

  get radixPointChar(): string;

  toDigit(var1: string): number;

  toChar(var1: number): string;
}
