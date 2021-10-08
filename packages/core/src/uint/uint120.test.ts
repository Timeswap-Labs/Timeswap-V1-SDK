import { Uint120 } from './uint120';

describe('Uint120 tests', () => {
  it('Overflow', () => {
    const num = new Uint120(Uint120.maxValue);
    expect(num.toBigInt()).toEqual(Uint120.maxValue);

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
