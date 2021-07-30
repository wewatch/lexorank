export class LexoRankBucket {
  static readonly BUCKET_0 = new LexoRankBucket(0);
  static readonly BUCKET_1 = new LexoRankBucket(1);
  static readonly BUCKET_2 = new LexoRankBucket(2);

  static readonly VALUES = [
    LexoRankBucket.BUCKET_0,
    LexoRankBucket.BUCKET_1,
    LexoRankBucket.BUCKET_2,
  ];

  static readonly BUCKETS_COUNT = LexoRankBucket.VALUES.length;

  private constructor(private readonly value: number) {}

  public static max(): LexoRankBucket {
    return LexoRankBucket.VALUES[LexoRankBucket.BUCKETS_COUNT - 1];
  }

  public static from(str: string): LexoRankBucket {
    const value = parseInt(str);
    const bucket = LexoRankBucket.VALUES[value];

    if (bucket === undefined) {
      throw new Error(`Unknown bucket: ${str}`);
    }

    return bucket;
  }

  public format(): string {
    return this.value.toString();
  }

  public next(): LexoRankBucket {
    return LexoRankBucket.VALUES[
      (this.value + 1) % LexoRankBucket.BUCKETS_COUNT
    ];
  }

  public prev(): LexoRankBucket {
    const n = LexoRankBucket.BUCKETS_COUNT;
    const v = this.value - 1;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    return LexoRankBucket.VALUES[((v % n) + n) % n];
  }

  public equals(other: LexoRankBucket): boolean {
    if (this === other) {
      return true;
    }

    return this.value === other.value;
  }
}
