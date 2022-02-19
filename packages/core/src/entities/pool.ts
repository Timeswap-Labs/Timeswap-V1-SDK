import { ERC20Token } from './erc20Token';
import { NativeToken } from './nativeToken';
import { Pair } from './pair';
import {
  CP,
  Claims,
  Tokens,
  LiquidityReturn,
  LendReturn,
  BorrowReturn,
} from './interface';
import { Uint256, Uint112, Uint128, Uint40, Uint16, Uint } from '../uint';

export class Pool {
  asset: NativeToken | ERC20Token;
  collateral: NativeToken | ERC20Token;
  maturity: Uint256;

  fee: Uint16;
  protocolFee: Uint16;

  constructor(
    asset: ERC20Token | NativeToken,
    collateral: ERC20Token | NativeToken,
    maturity: string | number | bigint | boolean | Uint,
    fee: string | number | bigint | boolean | Uint,
    protocolFee: string | number | bigint | boolean | Uint
  ) {
    this.asset = asset;
    this.collateral = collateral;
    this.maturity = new Uint256(maturity);

    this.fee = new Uint16(fee);
    this.protocolFee = new Uint16(protocolFee);
  }

  calculateApr(state: CP): number {
    return Pair.calculateApr(state);
  }

  calculateCdp(state: CP): bigint {
    return Pair.calculateCdp(state, this.asset.decimals);
  }

  newLiquidity(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    return Pair.calculateNewLiquidity(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      debtIn,
      collateralIn,
      now,
      feeStored
    );
  }

  liquidityGivenAsset(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    return Pair.calculateLiquidityGivenAsset(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      now,
      feeStored
    );
  }

  liquidityGivenDebt(
    state: CP,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    return Pair.calculateLiquidityGivenDebt(
      state,
      this.maturity,
      totalLiquidity,
      debtIn,
      now,
      feeStored
    );
  }

  liquidityGivenCollateral(
    state: CP,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    return Pair.calculateLiquidityGivenCollateral(
      state,
      this.maturity,
      totalLiquidity,
      collateralIn,
      now,
      feeStored
    );
  }

  lendGivenBond(
    state: CP,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256
  ): LendReturn {
    return Pair.calculateLendGivenBond(
      state,
      this.maturity,
      assetIn,
      bondOut,
      now,
      this.fee,
      this.protocolFee
    );
  }

  lendGivenInsurance(
    state: CP,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256
  ): LendReturn {
    return Pair.calculateLendGivenInsurance(
      state,
      this.maturity,
      assetIn,
      insuranceOut,
      now,
      this.fee,
      this.protocolFee
    );
  }

  lendGivenPercent(
    state: CP,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256
  ): LendReturn {
    return Pair.calculateLendGivenPercent(
      state,
      this.maturity,
      assetIn,
      percent,
      now,
      this.fee,
      this.protocolFee
    );
  }

  withdraw(reserves: Tokens, totalClaims: Claims, claimsIn: Claims): Tokens {
    return Pair.calculateWithdraw(reserves, totalClaims, claimsIn);
  }

  borrowGivenDebt(
    state: CP,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256
  ): BorrowReturn {
    return Pair.calculateBorrowGivenDebt(
      state,
      this.maturity,
      assetOut,
      debtIn,
      now,
      this.fee,
      this.protocolFee
    );
  }

  borrowGivenCollateral(
    state: CP,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): BorrowReturn {
    return Pair.calculateBorrowGivenCollateral(
      state,
      this.maturity,
      assetOut,
      collateralIn,
      now,
      this.fee,
      this.protocolFee
    );
  }

  borrowGivenPercent(
    state: CP,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256
  ): BorrowReturn {
    return Pair.calculateBorrowGivenPercent(
      state,
      this.maturity,
      assetOut,
      percent,
      now,
      this.fee,
      this.protocolFee
    );
  }

  burn(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256,
    feeStored: Uint256
  ): { assetOut: Uint256; collateralOut: Uint128 } {
    return Pair.calculateBurn(
      reserves,
      totalClaims,
      totalLiquidity,
      liquidityIn,
      feeStored
    );
  }
}
