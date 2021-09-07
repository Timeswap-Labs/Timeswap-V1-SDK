import { Uint112, Uint128 } from '..';

export interface State {
  asset: Uint112;
  interest: Uint112;
  cdp: Uint112;
}

export interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

export interface Due {
  debt: Uint112;
  collateral: Uint112;
}
