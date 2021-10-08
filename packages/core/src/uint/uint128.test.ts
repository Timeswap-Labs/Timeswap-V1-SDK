import { Uint128 } from './uint128';

describe('Uint128 tests', () => {
  it('Overflow', () => {
    const num = new Uint128(Uint128.maxValue);
    expect(num.toBigInt()).toEqual(Uint128.maxValue);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint128(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
