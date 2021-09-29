import { Uint120 } from './uint120';

const MAX_UINT_120 = 2n ** 120n - 1n;

describe('Uint120 tests', () => {
  it('Overflow', () => {
    const num = new Uint120(MAX_UINT_120);
    expect(num.toBigInt()).toEqual(MAX_UINT_120);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint120(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
