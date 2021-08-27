import { MAX_UINT_16, Uint16 } from './uint16';

describe('Uint16 tests', () => {
  it('Overflow', () => {
    const num = new Uint16(MAX_UINT_16);
    expect(num.get()).toEqual(MAX_UINT_16);

    num.addAssign(1);
    expect(num.get()).toEqual(null);
  });

  it('Underflow', () => {
    const num = new Uint16(0);
    expect(num.get()).toEqual(0n);

    num.subAssign(1);
    expect(num.get()).toEqual(null);
  });
});
