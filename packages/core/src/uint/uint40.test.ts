import { Uint40 } from './uint40';

const MAX_UINT_40 = 2n ** 40n - 1n;

describe('Uint40 tests', () => {
  it('Overflow', () => {
    const num = new Uint40(MAX_UINT_40);
    expect(num.toBigInt()).toEqual(MAX_UINT_40);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint40(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
