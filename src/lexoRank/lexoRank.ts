import { StringBuilder } from "../utils";
import { DEFAULT_CONFIG, LexoRankConfig } from "./config";
import { LexoDecimal } from "./lexoDecimal";
import { LexoRankBucket } from "./lexoRankBucket";

export class LexoRank {
  protected static config: LexoRankConfig = DEFAULT_CONFIG;

  constructor(
    public readonly bucket: LexoRankBucket,
    public readonly decimal: LexoDecimal,
  ) {}

  private get value(): string {
    return this.bucket.format() + "|" + LexoRank.formatDecimal(this.decimal);
  }

  public static min(): LexoRank {
    return LexoRank.from(LexoRankBucket.BUCKET_0, LexoRank.config.minDecimal);
  }

  public static middle(): LexoRank {
    const minLexoRank = LexoRank.min();
    return minLexoRank.between(LexoRank.max(minLexoRank.bucket));
  }

  public static max(
    bucket: LexoRankBucket = LexoRankBucket.BUCKET_0,
  ): LexoRank {
    return LexoRank.from(bucket, LexoRank.config.maxDecimal);
  }

  public static initial(bucket: LexoRankBucket): LexoRank {
    return bucket === LexoRankBucket.BUCKET_0
      ? LexoRank.from(bucket, LexoRank.config.initialMinDecimal)
      : LexoRank.from(bucket, LexoRank.config.initialMaxDecimal);
  }

  public static between(oLeft: LexoDecimal, oRight: LexoDecimal): LexoDecimal {
    if (oLeft.system.base !== oRight.system.base) {
      throw new Error("Expected same system");
    }

    let left = oLeft;
    let right = oRight;
    let nLeft: LexoDecimal;
    if (oLeft.scale < oRight.scale) {
      nLeft = oRight.setScale(oLeft.scale, false);
      if (oLeft.compareTo(nLeft) >= 0) {
        return LexoRank.mid(oLeft, oRight);
      }

      right = nLeft;
    }

    if (oLeft.scale > right.scale) {
      nLeft = oLeft.setScale(right.scale, true);
      if (nLeft.compareTo(right) >= 0) {
        return LexoRank.mid(oLeft, oRight);
      }

      left = nLeft;
    }

    let nRight: LexoDecimal;
    for (let scale = left.scale; scale > 0; right = nRight) {
      const nScale1 = scale - 1;
      const nLeft1 = left.setScale(nScale1, true);
      nRight = right.setScale(nScale1, false);
      const cmp = nLeft1.compareTo(nRight);
      if (cmp === 0) {
        return LexoRank.checkMid(oLeft, oRight, nLeft1);
      }
      if (nLeft1.compareTo(nRight) > 0) {
        break;
      }

      scale = nScale1;
      left = nLeft1;
    }

    let mid = LexoRank.middleInternal(oLeft, oRight, left, right);

    let nScale: number;
    for (let mScale = mid.scale; mScale > 0; mScale = nScale) {
      nScale = mScale - 1;
      const nMid = mid.setScale(nScale);
      if (oLeft.compareTo(nMid) >= 0 || nMid.compareTo(oRight) >= 0) {
        break;
      }

      mid = nMid;
    }

    return mid;
  }

  public static parse(str: string): LexoRank {
    const parts = str.split("|");
    const bucket = LexoRankBucket.from(parts[0]);
    const decimal = LexoDecimal.parse(parts[1], LexoRank.config.numeralSystem);
    return new LexoRank(bucket, decimal);
  }

  public static from(bucket: LexoRankBucket, decimal: LexoDecimal): LexoRank {
    if (decimal.system.base !== LexoRank.config.numeralSystem.base) {
      throw new Error("Expected different system");
    }

    return new LexoRank(bucket, decimal);
  }

  private static middleInternal(
    lbound: LexoDecimal,
    rbound: LexoDecimal,
    left: LexoDecimal,
    right: LexoDecimal,
  ): LexoDecimal {
    const mid = LexoRank.mid(left, right);
    return LexoRank.checkMid(lbound, rbound, mid);
  }

  private static checkMid(
    lbound: LexoDecimal,
    rbound: LexoDecimal,
    mid: LexoDecimal,
  ): LexoDecimal {
    if (lbound.compareTo(mid) >= 0) {
      return LexoRank.mid(lbound, rbound);
    }

    return mid.compareTo(rbound) >= 0 ? LexoRank.mid(lbound, rbound) : mid;
  }

  private static mid(left: LexoDecimal, right: LexoDecimal): LexoDecimal {
    const sum = left.add(right);
    const mid = sum.multiply(LexoDecimal.half(left.system));
    const scale = left.scale > right.scale ? left.scale : right.scale;
    if (mid.scale > scale) {
      const roundDown = mid.setScale(scale, false);
      if (roundDown.compareTo(left) > 0) {
        return roundDown;
      }
      const roundUp = mid.setScale(scale, true);
      if (roundUp.compareTo(right) < 0) {
        return roundUp;
      }
    }
    return mid;
  }

  private static formatDecimal(decimal: LexoDecimal): string {
    const formatVal = decimal.format();
    const val = new StringBuilder(formatVal);
    let partialIndex = formatVal.indexOf(
      LexoRank.config.numeralSystem.radixPointChar,
    );
    const zero = LexoRank.config.numeralSystem.toChar(0);
    if (partialIndex < 0) {
      partialIndex = formatVal.length;
      val.append(LexoRank.config.numeralSystem.radixPointChar);
    }

    while (partialIndex < 6) {
      val.insert(0, zero);
      ++partialIndex;
    }

    while (val[val.length - 1] === zero) {
      val.length = val.length - 1;
    }

    return val.toString();
  }

  public genPrev(): LexoRank {
    if (this.isMax()) {
      return new LexoRank(this.bucket, LexoRank.config.initialMaxDecimal);
    }

    const floorInteger = this.decimal.floor();
    const floorDecimal = LexoDecimal.from(floorInteger);
    let nextDecimal = floorDecimal.subtract(LexoRank.config.defaultGap);
    if (nextDecimal.compareTo(LexoRank.config.minDecimal) <= 0) {
      nextDecimal = LexoRank.between(LexoRank.config.minDecimal, this.decimal);
    }

    return new LexoRank(this.bucket, nextDecimal);
  }

  public genNext(): LexoRank {
    if (this.isMin()) {
      return new LexoRank(this.bucket, LexoRank.config.initialMinDecimal);
    }
    const ceilInteger = this.decimal.ceil();
    const ceilDecimal = LexoDecimal.from(ceilInteger);
    let nextDecimal = ceilDecimal.add(LexoRank.config.defaultGap);
    if (nextDecimal.compareTo(LexoRank.config.maxDecimal) >= 0) {
      nextDecimal = LexoRank.between(this.decimal, LexoRank.config.maxDecimal);
    }

    return new LexoRank(this.bucket, nextDecimal);
  }

  public between(other: LexoRank): LexoRank {
    if (!this.bucket.equals(other.bucket)) {
      throw new Error("Between works only within the same bucket");
    }

    const cmp = this.decimal.compareTo(other.decimal);
    if (cmp > 0) {
      return new LexoRank(
        this.bucket,
        LexoRank.between(other.decimal, this.decimal),
      );
    }

    if (cmp === 0) {
      throw new Error(
        "Try to rank between issues with same rank this=" +
          this +
          " other=" +
          other +
          " this.decimal=" +
          this.decimal +
          " other.decimal=" +
          other.decimal,
      );
    }

    return new LexoRank(
      this.bucket,
      LexoRank.between(this.decimal, other.decimal),
    );
  }

  public inNextBucket(): LexoRank {
    return LexoRank.from(this.bucket.next(), this.decimal);
  }

  public inPrevBucket(): LexoRank {
    return LexoRank.from(this.bucket.prev(), this.decimal);
  }

  public isMin(): boolean {
    return this.decimal.equals(LexoRank.config.minDecimal);
  }

  public isMax(): boolean {
    return this.decimal.equals(LexoRank.config.maxDecimal);
  }

  public format(): string {
    return this.value;
  }

  public equals(other: LexoRank): boolean {
    if (this === other) {
      return true;
    }

    if (!other) {
      return false;
    }

    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public compareTo(other: LexoRank): number {
    if (this === other) {
      return 0;
    }

    if (!other) {
      return 1;
    }

    return this.value.localeCompare(other.value);
  }
}
