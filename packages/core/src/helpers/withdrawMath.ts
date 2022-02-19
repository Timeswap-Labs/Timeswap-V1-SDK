import invariant from 'tiny-invariant';
import { Claims, Tokens } from '../entities';
import timeswapMath from './timeswapMath';

export function withdraw(
  reserves: Tokens,
  totalClaims: Claims,
  claimsIn: Claims
): Tokens {
  // invariant(block.timestamp >= param.maturity, 'E203');
  invariant(
    claimsIn.bondPrincipal.ne(0) ||
      claimsIn.bondInterest.ne(0) ||
      claimsIn.insurancePrincipal.ne(0) ||
      claimsIn.insuranceInterest.ne(0),
    'E205'
  );

  const tokensOut = timeswapMath.withdraw(reserves, totalClaims, claimsIn);

  return tokensOut;
}

export default {
  withdraw,
};
