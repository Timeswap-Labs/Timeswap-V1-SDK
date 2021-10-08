import { Uint256 } from './uint256';

describe('Uint256 tests', () => {
  it('Overflow', () => {
    const num = new Uint256(Uint256.maxValue);
    expect(num.toBigInt()).toEqual(Uint256.maxValue);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint256(0);
    expect(num.toBigInt()).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
