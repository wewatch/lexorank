import { buildConfig, LexoRankConfig, LexoRankOptions } from "./config";
import { LexoRank } from "./lexoRank";

export const buildLexoRank = (
  options: LexoRankOptions = {},
): typeof LexoRank => {
  const config = buildConfig(options);

  return class LR extends LexoRank {
    static config: LexoRankConfig = config;
  };
};
