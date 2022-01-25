import { Uint112, Uint128 } from '../uint';

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
