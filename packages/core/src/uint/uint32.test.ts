import { Uint32 } from './uint32';

describe('Uint32 tests', () => {
  it('Overflow', () => {
    const num = new Uint32(Uint32.maxValue);
    expect(num.toBigInt()).toEqual(Uint32.maxValue);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint32(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
