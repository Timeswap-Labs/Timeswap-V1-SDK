import { Uint16 } from './uint16';

describe('Uint16 tests', () => {
  it('Overflow', () => {
    const num = new Uint16(Uint16.maxValue);
    expect(num.toBigInt()).toEqual(Uint16.maxValue);

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
