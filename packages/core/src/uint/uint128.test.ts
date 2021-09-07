import { Uint128 } from './uint128';

const MAX_UINT_128 = 2n ** 128n - 1n;

describe('Uint128 tests', () => {
  it('Overflow', () => {
    const num = new Uint128(MAX_UINT_128);
    expect(num.value).toEqual(MAX_UINT_128);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint128(0);
    expect(num.value).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
