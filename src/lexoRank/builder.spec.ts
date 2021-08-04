import { NumeralSystem64 } from "../numeralSystems";
import { buildLexoRank } from "./builder";

describe("Custom LexoRank", () => {
  const LexoRank = buildLexoRank({
    NumeralSystem: NumeralSystem64,
    maxDecimal: "100000000",
    initialMinDecimal: "1000",
    defaultGap: "1000",
  });

  it("Min", () => {
    const minRank = LexoRank.min();
    expect(minRank.toString()).toEqual("0|000000:");
    expect(minRank.genPrev()).toEqual(minRank);
    expect(LexoRank.parse(minRank.format())).toEqual(minRank);
  });

  it("Max", () => {
    const maxRank = LexoRank.max();
    expect(maxRank.toString()).toEqual("0|zzzzzzzz:");
    expect(maxRank.genNext()).toEqual(maxRank);
    expect(LexoRank.parse(maxRank.format())).toEqual(maxRank);
  });

  it("genNext", () => {
    const rank = LexoRank.middle();
    expect(rank.genNext().toString()).toEqual("0|W0000zzz:");

    const minRank = LexoRank.min();
    expect(minRank.genNext().toString()).toEqual("0|001000:");
  });

  it("genPrev", () => {
    const rank = LexoRank.middle();
    expect(rank.genPrev().toString()).toEqual("0|Vzzzyzzz:");

    const maxRank = LexoRank.max();
    expect(maxRank.genPrev().toString()).toEqual("0|y0000000:");
  });
});
