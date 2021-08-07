import { LexoRankError } from "../error";
import { StringBuilder } from "../utils";
import { DEFAULT_CONFIG, LexoRankConfig } from "./config";
import { LexoDecimal } from "./lexoDecimal";
import { LexoRankBucket } from "./lexoRankBucket";

export class LexoRank {
  static config: LexoRankConfig = DEFAULT_CONFIG;

  cons: typeof LexoRank = this.constructor as typeof LexoRank;

  constructor(
    public readonly bucket: LexoRankBucket,
    public readonly decimal: LexoDecimal,
  ) {}

  private get value(): string {
    return this.bucket.format() + "|" + this.cons.formatDecimal(this.decimal);
  }

  public static min(
    bucket: LexoRankBucket = LexoRankBucket.BUCKET_0,
  ): LexoRank {
    return this.from(bucket, this.config.minDecimal);
  }

  public static middle(
    bucket: LexoRankBucket = LexoRankBucket.BUCKET_0,
  ): LexoRank {
    const minLexoRank = this.min(bucket);
    return minLexoRank.between(this.max(bucket));
  }

  public static max(
    bucket: LexoRankBucket = LexoRankBucket.BUCKET_0,
  ): LexoRank {
    return this.from(bucket, this.config.maxDecimal);
  }

  public static initial(
    bucket: LexoRankBucket = LexoRankBucket.BUCKET_0,
  ): LexoRank {
    return bucket.equals(LexoRankBucket.BUCKET_0)
      ? this.from(bucket, this.config.initialMinDecimal)
      : this.from(bucket, this.config.initialMaxDecimal);
  }

  public static between(oLeft: LexoDecimal, oRight: LexoDecimal): LexoDecimal {
    if (oLeft.system.base !== oRight.system.base) {
      throw new LexoRankError("Expected same system");
    }

    let left = oLeft;
    let right = oRight;
    let nLeft: LexoDecimal;
    if (oLeft.scale < oRight.scale) {
      nLeft = oRight.setScale(oLeft.scale, false);
      if (oLeft.compareTo(nLeft) >= 0) {
        return this.mid(oLeft, oRight);
      }

      right = nLeft;
    }

    if (oLeft.scale > right.scale) {
      nLeft = oLeft.setScale(right.scale, true);
      if (nLeft.compareTo(right) >= 0) {
        return this.mid(oLeft, oRight);
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
        return this.checkMid(oLeft, oRight, nLeft1);
      }
      if (nLeft1.compareTo(nRight) > 0) {
        break;
      }

      scale = nScale1;
      left = nLeft1;
    }

    let mid = this.middleInternal(oLeft, oRight, left, right);

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
    const decimal = LexoDecimal.parse(parts[1], this.config.numeralSystem);
    return new this(bucket, decimal);
  }

  public static from(bucket: LexoRankBucket, decimal: LexoDecimal): LexoRank {
    if (decimal.system.base !== this.config.numeralSystem.base) {
      throw new LexoRankError("Received different system");
    }

    return new this(bucket, decimal);
  }

  private static middleInternal(
    lbound: LexoDecimal,
    rbound: LexoDecimal,
    left: LexoDecimal,
    right: LexoDecimal,
  ): LexoDecimal {
    const mid = this.mid(left, right);
    return this.checkMid(lbound, rbound, mid);
  }

  private static checkMid(
    lbound: LexoDecimal,
    rbound: LexoDecimal,
    mid: LexoDecimal,
  ): LexoDecimal {
    if (lbound.compareTo(mid) >= 0) {
      return this.mid(lbound, rbound);
    }

    return mid.compareTo(rbound) >= 0 ? this.mid(lbound, rbound) : mid;
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
      this.config.numeralSystem.radixPointChar,
    );
    const zero = this.config.numeralSystem.toChar(0);
    if (partialIndex < 0) {
      partialIndex = formatVal.length;
      val.append(this.config.numeralSystem.radixPointChar);
    }

    while (partialIndex < this.config.maxOrder) {
      val.insert(0, zero);
      ++partialIndex;
    }

    while (val[val.length - 1] === zero) {
      --val.length;
    }

    return val.toString();
  }

  public genPrev(): LexoRank {
    const config = this.cons.config;

    if (this.isMax()) {
      return new this.cons(this.bucket, config.initialMaxDecimal);
    }

    const floorInteger = this.decimal.floor();
    const floorDecimal = LexoDecimal.from(floorInteger);
    let nextDecimal = floorDecimal.subtract(config.defaultGap);
    if (nextDecimal.compareTo(config.minDecimal) <= 0) {
      nextDecimal = this.cons.between(config.minDecimal, this.decimal);
    }

    return new this.cons(this.bucket, nextDecimal);
  }

  public genNext(): LexoRank {
    const config = this.cons.config;

    if (this.isMin()) {
      return new this.cons(this.bucket, config.initialMinDecimal);
    }

    const ceilInteger = this.decimal.ceil();
    const ceilDecimal = LexoDecimal.from(ceilInteger);
    let nextDecimal = ceilDecimal.add(config.defaultGap);
    if (nextDecimal.compareTo(config.maxDecimal) >= 0) {
      nextDecimal = this.cons.between(this.decimal, config.maxDecimal);
    }

    return new this.cons(this.bucket, nextDecimal);
  }

  public between(other: LexoRank): LexoRank {
    if (!this.bucket.equals(other.bucket)) {
      throw new LexoRankError("Between works only within the same bucket");
    }

    const cmp = this.decimal.compareTo(other.decimal);
    if (cmp > 0) {
      return new this.cons(
        this.bucket,
        this.cons.between(other.decimal, this.decimal),
      );
    }

    if (cmp === 0) {
      throw new LexoRankError(
        `Try to rank between items with same rank this=${this}, other=${other},` +
          ` this.decimal=${this.decimal}, other.decimal=${other.decimal}`,
      );
    }

    return new this.cons(
      this.bucket,
      this.cons.between(this.decimal, other.decimal),
    );
  }

  public inNextBucket(): LexoRank {
    return this.cons.from(this.bucket.next(), this.decimal);
  }

  public inPrevBucket(): LexoRank {
    return this.cons.from(this.bucket.prev(), this.decimal);
  }

  public isMin(): boolean {
    return this.decimal.equals(this.cons.config.minDecimal);
  }

  public isMax(): boolean {
    return this.decimal.equals(this.cons.config.maxDecimal);
  }

  public format(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: LexoRank): boolean {
    if (this === other) {
      return true;
    }

    return this.value === other.value;
  }

  public compareTo(other: LexoRank): number {
    if (this === other) {
      return 0;
    }

    return this.value.localeCompare(other.value);
  }
}
