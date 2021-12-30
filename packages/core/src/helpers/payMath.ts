import invariant from 'tiny-invariant';
import { Due } from '../entities';
import { Uint112 } from '../uint';

function checkProportional(debtIn: Uint112, collateralOut: Uint112, due: Due) {
  invariant(
    debtIn.toBigInt() * due.collateral.toBigInt() >=
      collateralOut.toBigInt() * due.debt.toBigInt(),
    'Forbidden'
  );
}

export default {
  checkProportional,
};
