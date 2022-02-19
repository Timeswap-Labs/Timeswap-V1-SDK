import invariant from 'tiny-invariant';
import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import timeswapMath from './timeswapMath';

export function burn(
  feeStored: Uint256,
  reserves: Tokens,
  totalClaims: Claims,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): { assetOut: Uint256; collateralOut: Uint128 } {
  // require(block.timestamp >= param.maturity, 'E203');
  invariant(liquidityIn.ne(0), 'E205');

  const { assetOut: _assetOut, collateralOut, feeOut } = timeswapMath.burn(
    totalLiquidity,
    feeStored,
    reserves,
    totalClaims,
    liquidityIn
  );

  const assetOut = new Uint256(_assetOut);
  assetOut.addAssign(feeOut);

  return { assetOut, collateralOut };
}

export default {
  burn,
};
