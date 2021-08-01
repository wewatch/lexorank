import { LexoRank } from "./lexoRank";

describe("LexoRank", () => {
  it("Min", () => {
    const minRank = LexoRank.min();
    expect(minRank.toString()).toEqual("0|000000:");
    expect(minRank.genPrev()).toEqual(minRank);
    expect(LexoRank.parse(minRank.format())).toEqual(minRank);
  });

  it("Max", () => {
    const maxRank = LexoRank.max();
    expect(maxRank.toString()).toEqual("0|zzzzzz:");
    expect(maxRank.genNext()).toEqual(maxRank);
    expect(LexoRank.parse(maxRank.format())).toEqual(maxRank);
  });

  it("Between Min <-> Max", () => {
    const minRank = LexoRank.min();
    const maxRank = LexoRank.max();
    const between = minRank.between(maxRank);
    expect(between.toString()).toEqual("0|hzzzzz:");
    expect(minRank.compareTo(between)).toBeLessThan(0);
    expect(maxRank.compareTo(between)).toBeGreaterThan(0);
  });

  it("Between Min <-> GetNext", () => {
    const minRank = LexoRank.min();
    const nextRank = minRank.genNext();
    const between = minRank.between(nextRank);
    expect(between.toString()).toEqual("0|0i0000:");
    expect(minRank.compareTo(between)).toBeLessThan(0);
    expect(nextRank.compareTo(between)).toBeGreaterThan(0);
  });

  it("Between Max <-> GetPrev", () => {
    const maxRank = LexoRank.max();
    const prevRank = maxRank.genPrev();
    const between = maxRank.between(prevRank);
    expect(between.toString()).toEqual("0|yzzzzz:");
    expect(maxRank.compareTo(between)).toBeGreaterThan(0);
    expect(prevRank.compareTo(between)).toBeLessThan(0);
  });

  it.each([
    ["0", "1", "0|0i0000:"],
    ["1", "0", "0|0i0000:"],
    ["3", "5", "0|10000o:"],
    ["5", "3", "0|10000o:"],
    ["15", "30", "0|10004s:"],
    ["31", "32", "0|10006s:"],
    ["100", "200", "0|1000x4:"],
    ["200", "100", "0|1000x4:"],
  ])("MoveTo", (prevStep, nextStep, expected) => {
    let prevRank = LexoRank.min();
    const prevStepInt = +prevStep;
    for (let i = 0; i < prevStepInt; i++) {
      prevRank = prevRank.genNext();
    }

    let nextRank = LexoRank.min();
    const nextStepInt = +nextStep;
    for (let i = 0; i < nextStepInt; i++) {
      nextRank = nextRank.genNext();
    }

    const between = prevRank.between(nextRank);
    expect(between.toString()).toEqual(expected);
  });

  it("Between with prev and next", () => {
    const rank = LexoRank.middle();
    const prev = rank.genPrev();
    const next = rank.genNext();

    expect(rank.equals(rank)).toBeTruthy();
    expect(rank.compareTo(rank)).toEqual(0);

    expect(rank).toEqual(prev.between(next));
    expect(rank.equals(prev.between(next))).toBeTruthy();

    const prev2 = prev.genPrev();
    const next2 = next.genNext();

    expect(prev).toEqual(rank.between(prev2));
    expect(next).toEqual(rank.between(next2));

    expect(() => rank.between(rank.inNextBucket())).toThrow();
    expect(() => rank.between(rank.inPrevBucket())).toThrow();
    expect(() => rank.between(rank)).toThrow();
  });
});
