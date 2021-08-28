import { AbstractToken } from '../..'; //from sdk-core
import { Uint256 } from '../../uint';

export class Pair {
  public constructor(
    asset: AbstractToken,
    collateral: AbstractToken,
    maturity: Uint256
  ) {}

  getState(maturity: Uint256) {}

  getTotalLocked(maturity: Uint256) {}

  getTotalLiquidity(maturity: Uint256) {}

  getLiquidityOf(maturity: Uint256, address: String) {}

  getTotalClaims(maturity: Uint256) {}

  getClaimsOf(maturity: Uint256, address: String) {}

  getDuesOf(maturity: Uint256, address: String) {}
}
