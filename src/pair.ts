import {
  ERC20Token,
  Pool,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  State,
  Uint40,
} from '.';
import LendMath, { LendResult } from './helpers/lendMath';
import BorrowMath, { BorrowResult } from './helpers/borrowMath';

export class Pair {
  public readonly asset: ERC20Token;
  public readonly collateral: ERC20Token;

  public readonly fee: Uint16;
  public readonly protocolFee: Uint16;

  constructor(
    asset: ERC20Token,
    collateral: ERC20Token,
    fee: string | number | bigint | boolean | Uint16,
    protocolFee: string | number | bigint | boolean | Uint16
  ) {
    this.asset = asset;
    this.collateral = collateral;

    this.fee = new Uint16(fee);
    this.protocolFee = new Uint16(protocolFee);
  }

  getPool(maturity: string | number | bigint | boolean | Uint256): Pool {
    return new Pool(this, maturity);
  }

  lendGivenBond(
    stateInput: StateInput,
    maturity: string | number | bigint | boolean | Uint256,
    assetIn: string | number | bigint | boolean | Uint112,
    bondOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): LendResult {
    return LendMath.givenBond(
      this.fee,
      stateInputTransform(stateInput),
      new Uint256(maturity),
      new Uint112(assetIn),
      new Uint128(bondOut),
      new Uint256(now)
    );
  }

  lendGivenInsurance(
    stateInput: StateInput,
    maturity: string | number | bigint | boolean | Uint256,
    assetIn: string | number | bigint | boolean | Uint112,
    insuranceOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): LendResult {
    return LendMath.givenInsurance(
      this.fee,
      stateInputTransform(stateInput),
      new Uint256(maturity),
      new Uint112(assetIn),
      new Uint128(insuranceOut),
      new Uint256(now)
    );
  }

  lendGivenPercent(
    stateInput: StateInput,
    assetIn: string | number | bigint | boolean | Uint112,
    percent: string | number | bigint | boolean | Uint40
  ): LendResult {
    return LendMath.givenPercent(
      this.fee,
      stateInputTransform(stateInput),
      new Uint112(assetIn),
      new Uint40(percent)
    );
  }

  borrowGivenDebt(
    stateInput: StateInput,
    maturity: string | number | bigint | boolean | Uint256,
    assetOut: string | number | bigint | boolean | Uint112,
    debtOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): BorrowResult {
    return BorrowMath.givenDebt(
      this.fee,
      stateInputTransform(stateInput),
      new Uint256(maturity),
      new Uint112(assetOut),
      new Uint128(debtOut),
      new Uint256(now)
    );
  }

  borrowGivenCollateral(
    stateInput: StateInput,
    maturity: string | number | bigint | boolean | Uint256,
    assetOut: string | number | bigint | boolean | Uint112,
    collateralIn: string | number | bigint | boolean | Uint112,
    now: string | number | bigint | boolean | Uint256
  ): BorrowResult {
    return BorrowMath.givenCollateral(
      this.fee,
      stateInputTransform(stateInput),
      new Uint256(maturity),
      new Uint112(assetOut),
      new Uint112(collateralIn),
      new Uint256(now)
    );
  }

  borrowGivenPercent(
    stateInput: StateInput,
    assetOut: string | number | bigint | boolean | Uint112,
    percent: string | number | bigint | boolean | Uint40
  ): BorrowResult {
    return BorrowMath.givenPercent(
      this.fee,
      stateInputTransform(stateInput),
      new Uint112(assetOut),
      new Uint40(percent)
    );
  }
}

function stateInputTransform({ asset, interest, cdp }: StateInput): State {
  return {
    asset: new Uint112(asset),
    interest: new Uint112(interest),
    cdp: new Uint112(cdp),
  };
}

interface StateInput {
  asset: string | number | bigint | boolean | Uint112;
  interest: string | number | bigint | boolean | Uint112;
  cdp: string | number | bigint | boolean | Uint112;
}
