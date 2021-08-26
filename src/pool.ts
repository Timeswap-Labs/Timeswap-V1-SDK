import { Pair } from '.';

export class Pool {
  pair: Pair;
  maturity: bigint;

  constructor(pair: Pair, maturity: bigint) {
    this.pair = pair;
    this.maturity = maturity;
  }
}
