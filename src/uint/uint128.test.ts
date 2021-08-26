import { MAX_UINT_128, Uint128 } from './uint128';

describe('Uint128 tests', () => {
  it('Overflow', () => {
    const num = new Uint128(MAX_UINT_128);
    expect(num.get()).toEqual(MAX_UINT_128);

    num.addAssign(1);
    expect(num.get()).toEqual(null);
  });

  it('Underflow', () => {
    const num = new Uint128(0);
    expect(num.get()).toEqual(0n);

    num.subAssign(1);
    expect(num.get()).toEqual(null);
  });
});
