import { LexoRankError } from "../error";
import { INumeralSystem } from "../numeralSystems";
import { StringBuilder } from "../utils";
import { LexoInteger } from "./lexoInteger";

export class LexoDecimal {
  public static half(sys: INumeralSystem): LexoDecimal {
    const mid: number = (sys.base / 2) | 0;
    return LexoDecimal.make(LexoInteger.make(sys, 1, [mid]), 1);
  }

  public static parse(str: string, system: INumeralSystem): LexoDecimal {
    const partialIndex = str.indexOf(system.radixPointChar);
    if (str.lastIndexOf(system.radixPointChar) !== partialIndex) {
      throw new LexoRankError(`More than one ${system.radixPointChar}`);
    }

    if (partialIndex < 0) {
      return LexoDecimal.make(LexoInteger.parse(str, system), 0);
    }

    const intStr =
      str.substring(0, partialIndex) + str.substring(partialIndex + 1);

    return LexoDecimal.make(
      LexoInteger.parse(intStr, system),
      str.length - 1 - partialIndex,
    );
  }

  public static from(integer: LexoInteger): LexoDecimal {
    return LexoDecimal.make(integer, 0);
  }

  public static make(integer: LexoInteger, scale: number): LexoDecimal {
    if (integer.isZero()) {
      return new LexoDecimal(integer, 0);
    }

    let zeroCount = 0;
    for (let i = 0; i < scale && integer.getMag(i) === 0; ++i) {
      ++zeroCount;
    }

    const newInteger = integer.shiftRight(zeroCount);
    const newScale = scale - zeroCount;
    return new LexoDecimal(newInteger, newScale);
  }

  /**
   * Represent a decimal as `mag / base ** scale`.
   */
  private constructor(readonly mag: LexoInteger, readonly scale: number) {}

  get system(): INumeralSystem {
    return this.mag.system;
  }

  public add(other: LexoDecimal): LexoDecimal {
    const {
      firstMag: thisMag,
      secondMag: otherMag,
      scale,
    } = LexoDecimal.alignScale(this, other);

    return LexoDecimal.make(thisMag.add(otherMag), scale);
  }

  public subtract(other: LexoDecimal): LexoDecimal {
    const {
      firstMag: thisMag,
      secondMag: otherMag,
      scale,
    } = LexoDecimal.alignScale(this, other);

    return LexoDecimal.make(thisMag.subtract(otherMag), scale);
  }

  private static alignScale(first: LexoDecimal, second: LexoDecimal) {
    let firstMag = first.mag;
    let firstScale = first.scale;
    let secondMag = second.mag;
    let secondScale = second.scale;

    while (firstScale < secondScale) {
      firstMag = firstMag.shiftLeft();
      ++firstScale;
    }

    while (firstScale > secondScale) {
      secondMag = secondMag.shiftLeft();
      ++secondScale;
    }

    return {
      firstMag,
      secondMag,
      scale: firstScale,
    };
  }

  public multiply(other: LexoDecimal): LexoDecimal {
    return LexoDecimal.make(
      this.mag.multiply(other.mag),
      this.scale + other.scale,
    );
  }

  public floor(): LexoInteger {
    return this.mag.shiftRight(this.scale);
  }

  public ceil(): LexoInteger {
    if (this.isExact()) {
      return this.mag;
    }

    const floor = this.floor();
    return floor.add(LexoInteger.one(floor.system));
  }

  public isExact(): boolean {
    if (this.scale === 0) {
      return true;
    }

    for (let i = 0; i < this.scale; ++i) {
      if (this.mag.getMag(i) !== 0) {
        return false;
      }
    }

    return true;
  }

  public setScale(newScale: number, ceiling = false): LexoDecimal {
    if (newScale >= this.scale) {
      return this;
    }

    if (newScale < 0) {
      newScale = 0;
    }

    const diff = this.scale - newScale;
    let newMag = this.mag.shiftRight(diff);
    if (ceiling) {
      newMag = newMag.add(LexoInteger.one(newMag.system));
    }

    return LexoDecimal.make(newMag, newScale);
  }

  public compareTo(other: LexoDecimal): number {
    if (this === other) {
      return 0;
    }

    if (!other) {
      return 1;
    }

    let tMag = this.mag;
    let oMag = other.mag;
    if (this.scale > other.scale) {
      oMag = oMag.shiftLeft(this.scale - other.scale);
    } else if (this.scale < other.scale) {
      tMag = tMag.shiftLeft(other.scale - this.scale);
    }
    return tMag.compareTo(oMag);
  }

  public format(): string {
    const intStr = this.mag.format();
    if (this.scale === 0) {
      return intStr;
    }

    const sb = new StringBuilder(intStr);
    const head = sb.toString()[0];
    const specialHead =
      head === this.mag.system.positiveChar ||
      head === this.mag.system.negativeChar;

    if (specialHead) {
      sb.remove(0, 1);
    }

    while (sb.length < this.scale + 1) {
      sb.insert(0, this.mag.system.toChar(0));
    }

    sb.insert(sb.length - this.scale, this.mag.system.radixPointChar);

    if (sb.length - this.scale === 0) {
      sb.insert(0, this.mag.system.toChar(0));
    }

    if (specialHead) {
      sb.insert(0, head);
    }

    return sb.toString();
  }

  public equals(other: LexoDecimal): boolean {
    if (this === other) {
      return true;
    }

    if (!other) {
      return false;
    }

    return this.mag.equals(other.mag) && this.scale === other.scale;
  }

  public toString(): string {
    return this.format();
  }
}
