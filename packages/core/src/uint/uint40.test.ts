import { Uint40 } from './uint40';

describe('Uint40 tests', () => {
  it('Overflow', () => {
    const num = new Uint40(Uint40.maxValue);
    expect(num.toBigInt()).toEqual(Uint40.maxValue);

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
