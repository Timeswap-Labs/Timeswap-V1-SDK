import { Uint32 } from './uint32';

const MAX_UINT_32 = 2n ** 32n - 1n;

describe('Uint32 tests', () => {
  it('Overflow', () => {
    const num = new Uint32(MAX_UINT_32);
    expect(num.value).toEqual(MAX_UINT_32);

    expect(() => {
      num.addAssign(1);
    }).toThrowError('Addition out of bounds');
  });

  it('Underflow', () => {
    const num = new Uint32(0);
    expect(num.value).toEqual(0n);

    expect(() => {
      num.subAssign(1);
    }).toThrowError('Subtraction out of bounds');
  });
});
