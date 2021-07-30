import { LexoRankBucket } from "./lexoRankBucket";

describe("LexoRank", () => {
  test("from string", () => {
    expect(() => LexoRankBucket.from("")).toThrow("Unknown bucket: ");

    expect(LexoRankBucket.from("0")).toEqual(LexoRankBucket.BUCKET_0);
  });

  test("prev, next", () => {
    for (const bucket of LexoRankBucket.VALUES) {
      expect(bucket.prev().next()).toEqual(bucket);
      expect(bucket.next().prev()).toEqual(bucket);
    }
  });
});
