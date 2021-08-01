import { INumeralSystem, NumeralSystem36 } from "../numeralSystems";
import { LexoDecimal } from "./lexoDecimal";

interface Type<T = unknown> {
  new (...args: never[]): T;
}

export interface LexoRankOptions {
  NumeralSystem?: Type<INumeralSystem>;
  defaultGap?: string;
  maxDecimal?: string;
  initialMinDecimal?: string;
  initialMaxDecimal?: string;
}

export interface LexoRankConfig {
  numeralSystem: INumeralSystem;
  zeroDecimal: LexoDecimal;
  oneDecimal: LexoDecimal;
  defaultGap: LexoDecimal;
  minDecimal: LexoDecimal;
  maxDecimal: LexoDecimal;
  initialMinDecimal: LexoDecimal;
  initialMaxDecimal: LexoDecimal;
}

export const configBuilder = ({
  NumeralSystem = NumeralSystem36,
  defaultGap = "8",
  maxDecimal = "1000000",
  initialMinDecimal = "100000",
  initialMaxDecimal,
}: LexoRankOptions = {}): LexoRankConfig => {
  const system = new NumeralSystem();

  const zeroDecimal = LexoDecimal.parse("0", system);
  const oneDecimal = LexoDecimal.parse("1", system);

  initialMaxDecimal ??= system.toChar(system.base - 2) + "00000";

  return {
    numeralSystem: system,
    zeroDecimal,
    oneDecimal,
    defaultGap: LexoDecimal.parse(defaultGap, system),
    minDecimal: zeroDecimal,
    maxDecimal: LexoDecimal.parse(maxDecimal, system).subtract(oneDecimal),
    initialMinDecimal: LexoDecimal.parse(initialMinDecimal, system),
    initialMaxDecimal: LexoDecimal.parse(initialMaxDecimal, system),
  };
};

export const DEFAULT_CONFIG = configBuilder();
