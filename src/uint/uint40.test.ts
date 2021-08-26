import { MAX_UINT_40, Uint40 } from './uint40';

describe('Uint40 tests', () => {
  it('Overflow', () => {
    const num = new Uint40(MAX_UINT_40);
    expect(num.get()).toEqual(MAX_UINT_40);

    num.addAssign(1);
    expect(num.get()).toEqual(null);
  });

  it('Underflow', () => {
    const num = new Uint40(0);
    expect(num.get()).toEqual(0n);

    num.subAssign(1);
    expect(num.get()).toEqual(null);
  });
});
