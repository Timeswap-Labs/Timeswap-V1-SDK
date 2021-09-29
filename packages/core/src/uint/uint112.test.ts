import { Uint112 } from './uint112';

const MAX_UINT_112 = 2n ** 112n - 1n;

describe('Uint112 tests', () => {
  it('Overflow', () => {
    const num = new Uint112(MAX_UINT_112);
    expect(num.toBigInt()).toEqual(MAX_UINT_112);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint112(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
