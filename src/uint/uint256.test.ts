import { MAX_UINT_256, Uint256 } from './uint256';

describe('Uint256 tests', () => {
  it('Overflow', () => {
    const num = new Uint256(MAX_UINT_256);
    expect(num.get()).toEqual(MAX_UINT_256);

    num.addAssign(1);
    expect(num.get()).toEqual(null);
  });

  it('Underflow', () => {
    const num = new Uint256(0);
    expect(num.get()).toEqual(0n);

    num.subAssign(1);
    expect(num.get()).toEqual(null);
  });
});
