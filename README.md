# LexoRank

[![CI](https://github.com/wewatch/lexorank/actions/workflows/ci.yml/badge.svg)](https://github.com/wewatch/lexorank/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/wewatch/lexorank/badge.svg?branch=develop)](https://coveralls.io/github/wewatch/lexorank?branch=develop)

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## About

A reference implementation of a list ordering system
like [JIRA's Lexorank algorithm](https://www.youtube.com/watch?v=OjQv9xMoFbg). This project is a fork
from [lexorank-ts](https://github.com/kvandake/lexorank-ts) with modifications to allow customizations.

## Installation

- npm

  ```shell
  npm install @wewatch/lexorank
  ```

- yarn

  ```shell
  yarn add @wewatch/lexorank
  ```

## Usage

### Static methods

```typescript
import { LexoRank } from "@wewatch/lexorank";

// min
const minLexoRank = LexoRank.min();

// max
const maxLexoRank = LexoRank.max();

// middle
const midLexoRank = LexoRank.middle();

// parse
const parsedLexoRank = LexoRank.parse("0|0i0000:");
```

### Public methods

```typescript
import { LexoRank } from "@wewatch/lexorank";

// any lexoRank
const lexoRank = LexoRank.middle();

// generate next lexorank
const nextLexoRank = lexoRank.genNext();

// generate previous lexorank
const prevLexoRank = lexoRank.genPrev();

// toString
const lexoRankStr = lexoRank.toString();
```

### Calculate LexoRank

LexRank calculation based on existing LexoRanks.

```typescript
import { LexoRank } from "@wewatch/lexorank";

// any lexorank
const rank1 = LexoRank.min();

// another lexorank
const rank2 = rank1.genNext().genNext();

// calculate between
const betweenLexoRank = rank1.between(rank2);
```

## Customize

```typescript
import { buildLexoRank, NumeralSystem64 } from "@wewatch/lexorank";

const LexoRank = buildLexoRank({
  NumeralSystem: NumeralSystem64,
  maxDecimal: "100000000",
  initialMinDecimal: "1000",
  defaultGap: "1000",
});
```

## License

Apache-2.0
