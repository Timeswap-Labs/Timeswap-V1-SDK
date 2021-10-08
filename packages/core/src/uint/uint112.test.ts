import { Uint112 } from './uint112';

describe('Uint112 tests', () => {
  it('Overflow', () => {
    const num = new Uint112(Uint112.maxValue);
    expect(num.toBigInt()).toEqual(Uint112.maxValue);

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
