import invariant from 'tiny-invariant';
import { Due } from '../entities';
import { Uint112 } from '../uint';

function checkProportional(debtIn: Uint112, collateralOut: Uint112, due: Due) {
  invariant(
    debtIn.value * due.collateral.value >= collateralOut.value * due.debt.value,
    'Forbidden'
  );
}

export default {
  checkProportional,
};
