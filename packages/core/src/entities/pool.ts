import { ERC20Token } from './erc20Token';
import { NativeToken } from './nativeToken';
import { Pair } from './pair';
import { CP, Claims, Due, Tokens } from './interface';
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
    now: Uint256
  ): LiquidityReturn1 {
    return Pair.calculateNewLiquidity(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      debtIn,
      collateralIn,
      now,
      this.protocolFee
    );
  }

  liquidityGivenAsset(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256
  ): LiquidityReturn1 {
    return Pair.calculateLiquidityGivenAsset(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      now,
      this.protocolFee
    );
  }

  liquidityGivenDebt(
    state: CP,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    now: Uint256
  ): LiquidityReturn2 {
    return Pair.calculateLiquidityGivenDebt(
      state,
      this.maturity,
      totalLiquidity,
      debtIn,
      now,
      this.protocolFee
    );
  }

  liquidityGivenCollateral(
    state: CP,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    now: Uint256
  ): LiquidityReturn2 {
    return Pair.calculateLiquidityGivenCollateral(
      state,
      this.maturity,
      totalLiquidity,
      collateralIn,
      now,
      this.protocolFee
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
      this.fee
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
      this.fee
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
      this.fee
    );
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
      this.fee
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
      this.fee
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
      this.fee
    );
  }

  withdraw(reserves: Tokens, totalClaims: Claims, claimsIn: Claims): Tokens {
    return Pair.calculateWithdraw(reserves, totalClaims, claimsIn);
  }

  burn(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256
  ): Tokens {
    return Pair.calculateBurn(
      reserves,
      totalClaims,
      totalLiquidity,
      liquidityIn
    );
  }
}

interface LiquidityReturn1 {
  liquidityOut: Uint256;
  dueOut: Due;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

interface LiquidityReturn2 extends LiquidityReturn1 {
  xIncrease: Uint112;
}

interface LendReturn {
  claims: Claims;
  yDecrease: Uint112;
  zDecrease: Uint112;
}

interface BorrowReturn {
  due: Due;
  yIncrease: Uint112;
  zIncrease: Uint112;
}
