import { Uint112, Uint128 } from '../uint';

export interface CP {
  x: Uint112;
  y: Uint112;
  z: Uint112;
}

export interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

export interface Due {
  debt: Uint112;
  collateral: Uint112;
}
