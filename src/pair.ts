import { ERC20Token, Pool, Uint112 } from '.';

export class Pair {
  public readonly asset: ERC20Token;
  public readonly collateral: ERC20Token;

  public readonly fee: bigint;
  public readonly protocolFee: bigint;

  constructor(
    asset: ERC20Token,
    collateral: ERC20Token,
    fee: bigint,
    protocolFee: bigint
  ) {
    this.asset = asset;
    this.collateral = collateral;

    this.fee = fee;
    this.protocolFee = protocolFee;
  }

  getPool(maturity: bigint): Pool {
    return new Pool(this, maturity);
  }

  //   setState()

  lendGivenBond(state: State, maturity, now) {}
}

export interface State {
  asset: Uint112;
  interest: Uint112;
  cdp: Uint112;
}
