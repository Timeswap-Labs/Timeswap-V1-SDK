export abstract class AbstractToken {
  public abstract readonly isNative: boolean;
  public abstract readonly isERC20: boolean;

  public readonly chainID: number;
  public readonly decimals: number;

  public readonly symbol?: string;
  public readonly name?: string;

  constructor(
    chainID: number,
    decimals: number,
    symbol?: string,
    name?: string
  ) {
    this.chainID = chainID;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
}
