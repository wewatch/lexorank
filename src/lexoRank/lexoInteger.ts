import { LexoRankError } from "../error";
import { INumeralSystem } from "../numeralSystems";
import { arrayCopy, StringBuilder } from "../utils";

export class LexoInteger {
  public static parse(strFull: string, system: INumeralSystem): LexoInteger {
    let str = strFull;
    let sign = 1;
    if (strFull.indexOf(system.positiveChar) === 0) {
      str = strFull.substring(1);
    } else if (strFull.indexOf(system.negativeChar) === 0) {
      str = strFull.substring(1);
      sign = -1;
    }

    const mag = new Array<number>(str.length);
    let strIndex: number = mag.length - 1;

    for (let magIndex = 0; strIndex >= 0; ++magIndex) {
      mag[magIndex] = system.toDigit(str.charAt(strIndex));
      --strIndex;
    }

    return LexoInteger.make(system, sign, mag);
  }

  public static zero(system: INumeralSystem): LexoInteger {
    return new LexoInteger(system, 0, LexoInteger.ZERO_MAG);
  }

  public static one(system: INumeralSystem): LexoInteger {
    return LexoInteger.make(system, 1, LexoInteger.ONE_MAG);
  }

  public static make(
    system: INumeralSystem,
    sign: number,
    mag: number[],
  ): LexoInteger {
    let actualLength: number;
    for (
      actualLength = mag.length;
      actualLength > 0 && mag[actualLength - 1] === 0;
      --actualLength
    ) {
      // ignore
    }

    if (actualLength === 0) {
      return LexoInteger.zero(system);
    }

    if (actualLength === mag.length) {
      return new LexoInteger(system, sign, mag);
    }

    const newMag = new Array<number>(actualLength).fill(0);
    arrayCopy(mag, 0, newMag, 0, actualLength);
    return new LexoInteger(system, sign, newMag);
  }

  private static ZERO_MAG = [0];
  private static ONE_MAG = [1];

  private static add(
    system: INumeralSystem,
    left: number[],
    right: number[],
  ): number[] {
    const estimatedSize = Math.max(left.length, right.length);
    const result = new Array(estimatedSize).fill(0);
    let carry = 0;
    for (let i = 0; i < estimatedSize; ++i) {
      const leftNum = i < left.length ? left[i] : 0;
      const rightNum = i < right.length ? right[i] : 0;
      let sum = leftNum + rightNum + carry;
      for (carry = 0; sum >= system.base; sum -= system.base) {
        ++carry;
      }

      result[i] = sum;
    }

    return LexoInteger.extendWithCarry(result, carry);
  }

  private static extendWithCarry(mag: number[], carry: number): number[] {
    if (carry > 0) {
      const extendedMag = new Array<number>(mag.length + 1).fill(0);
      arrayCopy(mag, 0, extendedMag, 0, mag.length);
      extendedMag[extendedMag.length - 1] = carry;
      return extendedMag;
    }

    return mag;
  }

  private static subtract(
    system: INumeralSystem,
    left: number[],
    right: number[],
  ): number[] {
    const rComplement = LexoInteger.complement(system, right, left.length);
    const rSum = LexoInteger.add(system, left, rComplement);
    rSum[rSum.length - 1] = 0;
    return LexoInteger.add(system, rSum, LexoInteger.ONE_MAG);
  }

  private static multiply(
    system: INumeralSystem,
    left: number[],
    right: number[],
  ): number[] {
    const result = new Array(left.length + right.length).fill(0);
    for (let li = 0; li < left.length; ++li) {
      for (let ri = 0; ri < right.length; ++ri) {
        const resultIndex = li + ri;
        for (
          result[resultIndex] += left[li] * right[ri];
          result[resultIndex] >= system.base;
          result[resultIndex] -= system.base
        ) {
          ++result[resultIndex + 1];
        }
      }
    }

    return result;
  }

  private static complement(
    system: INumeralSystem,
    mag: number[],
    digits: number,
  ): number[] {
    if (digits <= 0) {
      throw new LexoRankError("Expected at least 1 digit");
    }

    const newMag = new Array(digits).fill(system.base - 1);
    for (let i = 0; i < mag.length; ++i) {
      newMag[i] = system.base - 1 - mag[i];
    }

    return newMag;
  }

  private static compare(left: number[], right: number[]): number {
    if (left.length < right.length) {
      return -1;
    }

    if (left.length > right.length) {
      return 1;
    }

    for (let i = left.length - 1; i >= 0; --i) {
      if (left[i] < right[i]) {
        return -1;
      }
      if (left[i] > right[i]) {
        return 1;
      }
    }

    return 0;
  }

  constructor(
    readonly system: INumeralSystem,
    readonly sign: number,
    readonly mag: number[],
  ) {}

  public add(other: LexoInteger): LexoInteger {
    this.checkSystem(other);
    if (this.isZero()) {
      return other;
    }

    if (other.isZero()) {
      return this;
    }

    if (this.sign !== other.sign) {
      let pos;
      if (this.sign === -1) {
        pos = this.negate();
        const val = pos.subtract(other);
        return val.negate();
      }

      pos = other.negate();
      return this.subtract(pos);
    }

    const result = LexoInteger.add(this.system, this.mag, other.mag);
    return LexoInteger.make(this.system, this.sign, result);
  }

  public subtract(other: LexoInteger): LexoInteger {
    this.checkSystem(other);
    if (this.isZero()) {
      return other.negate();
    }

    if (other.isZero()) {
      return this;
    }

    if (this.sign !== other.sign) {
      let negate;
      if (this.sign === -1) {
        negate = this.negate();
        const sum = negate.add(other);
        return sum.negate();
      }

      negate = other.negate();
      return this.add(negate);
    }

    const cmp = LexoInteger.compare(this.mag, other.mag);
    if (cmp === 0) {
      return LexoInteger.zero(this.system);
    }

    return cmp < 0
      ? LexoInteger.make(
          this.system,
          this.sign === -1 ? 1 : -1,
          LexoInteger.subtract(this.system, other.mag, this.mag),
        )
      : LexoInteger.make(
          this.system,
          this.sign === -1 ? -1 : 1,
          LexoInteger.subtract(this.system, this.mag, other.mag),
        );
  }

  public multiply(other: LexoInteger): LexoInteger {
    this.checkSystem(other);
    if (this.isZero()) {
      return this;
    }

    if (other.isZero()) {
      return other;
    }

    if (this.isOneish()) {
      return this.sign === other.sign
        ? LexoInteger.make(this.system, 1, other.mag)
        : LexoInteger.make(this.system, -1, other.mag);
    }

    if (other.isOneish()) {
      return this.sign === other.sign
        ? LexoInteger.make(this.system, 1, this.mag)
        : LexoInteger.make(this.system, -1, this.mag);
    }

    const newMag = LexoInteger.multiply(this.system, this.mag, other.mag);
    return this.sign === other.sign
      ? LexoInteger.make(this.system, 1, newMag)
      : LexoInteger.make(this.system, -1, newMag);
  }

  public negate(): LexoInteger {
    return this.isZero()
      ? this
      : LexoInteger.make(this.system, this.sign === 1 ? -1 : 1, this.mag);
  }

  public shiftLeft(times = 1): LexoInteger {
    if (times === 0) {
      return this;
    }

    if (times < 0) {
      return this.shiftRight(Math.abs(times));
    }

    const newMag = new Array<number>(this.mag.length + times).fill(0);
    arrayCopy(this.mag, 0, newMag, times, this.mag.length);
    return LexoInteger.make(this.system, this.sign, newMag);
  }

  public shiftRight(times = 1): LexoInteger {
    if (this.mag.length <= times) {
      return LexoInteger.zero(this.system);
    }

    const newMag = new Array<number>(this.mag.length - times).fill(0);
    arrayCopy(this.mag, times, newMag, 0, newMag.length);
    return LexoInteger.make(this.system, this.sign, newMag);
  }

  public complement(): LexoInteger {
    return this.complementDigits(this.mag.length);
  }

  public complementDigits(digits: number): LexoInteger {
    return LexoInteger.make(
      this.system,
      this.sign,
      LexoInteger.complement(this.system, this.mag, digits),
    );
  }

  public isZero(): boolean {
    return this.sign === 0 && this.mag.length === 1 && this.mag[0] === 0;
  }

  public isOne(): boolean {
    return this.sign === 1 && this.mag.length === 1 && this.mag[0] === 1;
  }

  public getMag(index: number): number {
    return this.mag[index];
  }

  public compareTo(other: LexoInteger): number {
    if (this === other) {
      return 0;
    }

    if (!other) {
      return 1;
    }

    if (this.sign === -1) {
      if (other.sign === -1) {
        const cmp = LexoInteger.compare(this.mag, other.mag);
        return -cmp;
      }

      return -1;
    }

    if (this.sign === 1) {
      return other.sign === 1 ? LexoInteger.compare(this.mag, other.mag) : 1;
    }

    if (other.sign === -1) {
      return 1;
    }

    return other.sign === 1 ? -1 : 0;
  }

  public format(): string {
    if (this.isZero()) {
      return "" + this.system.toChar(0);
    }

    const sb = new StringBuilder();
    const var2 = this.mag;
    const var3 = var2.length;
    for (let var4 = 0; var4 < var3; ++var4) {
      const digit = var2[var4];
      sb.insert(0, this.system.toChar(digit));
    }

    if (this.sign === -1) {
      sb.insert(0, this.system.negativeChar);
    }

    return sb.toString();
  }

  public equals(other: LexoInteger): boolean {
    if (this === other) {
      return true;
    }

    if (!other) {
      return false;
    }

    return (
      this.system.base === other.system.base && this.compareTo(other) === 0
    );
  }

  public toString(): string {
    return this.format();
  }

  private isOneish(): boolean {
    return this.mag.length === 1 && this.mag[0] === 1;
  }

  private checkSystem(other: LexoInteger) {
    if (this.system.base !== other.system.base) {
      throw new LexoRankError("Expected numbers of same numeral system");
    }
  }
}
