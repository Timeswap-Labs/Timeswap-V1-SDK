import { Uint112, Uint128, Uint256 } from '../uint';

export interface CP {
  x: Uint112;
  y: Uint112;
  z: Uint112;
}

export interface Claims {
  bondPrincipal: Uint112;
  bondInterest: Uint112;
  insurancePrincipal: Uint112;
  insuranceInterest: Uint112;
}

export interface Due {
  debt: Uint112;
  collateral: Uint112;
}
export interface Tokens {
  asset: Uint128;
  collateral: Uint128;
}

export interface LiquidityReturn {
  assetIn: Uint256;
  liquidityOut: Uint256;
  dueOut: Due;
  xIncrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

export interface LendReturn {
  assetIn: Uint256;
  claimsOut: Claims;
  xIncrease: Uint112;
  yDecrease: Uint112;
  zDecrease: Uint112;
}

export interface BorrowReturn {
  assetOut: Uint256;
  dueOut: Due;
  xDecrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
}
