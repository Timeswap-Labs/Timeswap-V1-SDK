import { Uint256 } from './uint256';

const MAX_UINT_256 = 2n ** 256n - 1n;

describe('Uint256 tests', () => {
  it('Overflow', () => {
    const num = new Uint256(MAX_UINT_256);
    expect(num.value).toEqual(MAX_UINT_256);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint256(0);
    expect(num.value).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
