import { Uint112, Uint16, Uint256, Uint40 } from '../uint';
import { Pair } from './pair';

describe('Pair tests', () => {
  it('Test 1', () => {
    Pair.calculateLiquidityGivenAsset(
      {
        x: new Uint112(5099303755853777805131n),
        y: new Uint112(67221378571917947008883n),
        z: new Uint112(1877369965344068970n),
      },
      new Uint256(1654020000n),
      new Uint256(327680000000000000000000000n),
      new Uint112(3000000000000000000n),
      new Uint256(1649835506n),
      new Uint256(581096075885447254n)
    );
  });

  it('Test 2', () => {
    Pair.calculateLiquidityGivenAsset(
      {
        x: new Uint112(42007650537n),
        y: new Uint112(439305738839n),
        z: new Uint112(32905668061664118996234n),
      },
      new Uint256(1650366000n),
      new Uint256(3145728000000000n),
      new Uint112(5000000000000000000n),
      new Uint256(1649835506n),
      new Uint256(29156019n)
    );
  });

  it('Test 3 (Add min lend)', () => {
    Pair.calculateLendGivenPercent(
      {
        x: new Uint112(42007650537n),
        y: new Uint112(439305738839n),
        z: new Uint112(32905668061664118996234n),
      },
      new Uint256(1650366000n),
      new Uint112(10000000n),
      new Uint40(0n),
      new Uint256(1649835506n),
      new Uint16(434),
      new Uint16(86)
    );
  });

  it('Test 4 (Add min lend)', () => {
    Pair.calculateLendGivenPercent(
      {
        x: new Uint112(42007650537n),
        y: new Uint112(439305738839n),
        z: new Uint112(32905668061664118996234n),
      },
      new Uint256(1650366000n),
      new Uint112(10000000n),
      new Uint40(2n ** 32n),
      new Uint256(1649835506n),
      new Uint16(434),
      new Uint16(86)
    );
  });

  it('Test 5 (Add min borrow)', () => {
    Pair.calculateBorrowGivenPercent(
      {
        x: new Uint112(42007650537n),
        y: new Uint112(439305738839n),
        z: new Uint112(32905668061664118996234n),
      },
      new Uint256(1650366000n),
      new Uint112(10000000n),
      new Uint40(0n),
      new Uint256(1649835506n),
      new Uint16(434),
      new Uint16(86)
    );
  });

  it('Test 6 (Add min borrow)', () => {
    Pair.calculateBorrowGivenPercent(
      {
        x: new Uint112(42007650537n),
        y: new Uint112(439305738839n),
        z: new Uint112(32905668061664118996234n),
      },
      new Uint256(1650366000n),
      new Uint112(10000000n),
      new Uint40(2n ** 32n),
      new Uint256(1649835506n),
      new Uint16(434),
      new Uint16(86)
    );
  });
});
