import { Uint16 } from './uint16';

const MAX_UINT_16 = 2n ** 16n - 1n;

describe('Uint16 tests', () => {
  it('Overflow', () => {
    const num = new Uint16(MAX_UINT_16);
    expect(num.toBigInt()).toEqual(MAX_UINT_16);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint16(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
