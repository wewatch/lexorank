import { INumeralSystem, NumeralSystem36 } from "../numeralSystems";
import { LexoDecimal } from "./lexoDecimal";

interface Type<T = unknown> {
  new (...args: never[]): T;
}

export interface LexoRankOptions {
  NumeralSystem?: Type<INumeralSystem>;
  defaultGap?: string;
  maxOrder?: number;
  initialMinDecimal?: string;
}

export interface LexoRankConfig {
  numeralSystem: INumeralSystem;
  zeroDecimal: LexoDecimal;
  oneDecimal: LexoDecimal;
  defaultGap: LexoDecimal;
  maxOrder: number;
  minDecimal: LexoDecimal;
  maxDecimal: LexoDecimal;
  initialMinDecimal: LexoDecimal;
  initialMaxDecimal: LexoDecimal;
}

export const buildConfig = ({
  NumeralSystem = NumeralSystem36,
  defaultGap = "8",
  maxOrder = 6,
  initialMinDecimal = "100000",
}: LexoRankOptions = {}): LexoRankConfig => {
  const system = new NumeralSystem();

  const zeroDecimal = LexoDecimal.parse("0", system);
  const oneDecimal = LexoDecimal.parse("1", system);

  const minDecimal = zeroDecimal;
  const maxDecimal = LexoDecimal.parse(
    "1".padEnd(maxOrder + 1, "0"),
    system,
  ).subtract(oneDecimal);

  const initialMaxDecimal = system
    .toChar(system.base - 2)
    .padEnd(maxOrder, "0");

  return {
    numeralSystem: system,
    zeroDecimal,
    oneDecimal,
    minDecimal,
    maxDecimal,
    maxOrder,
    defaultGap: LexoDecimal.parse(defaultGap, system),
    initialMinDecimal: LexoDecimal.parse(initialMinDecimal, system),
    initialMaxDecimal: LexoDecimal.parse(initialMaxDecimal, system),
  };
};

export const DEFAULT_CONFIG = buildConfig();
