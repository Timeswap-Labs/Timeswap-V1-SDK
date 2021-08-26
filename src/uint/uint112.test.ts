import { MAX_UINT_112, Uint112 } from './uint112';

describe('Uint112 tests', () => {
  it('Overflow', () => {
    const num = new Uint112(MAX_UINT_112);
    expect(num.get()).toEqual(MAX_UINT_112);

    num.addAssign(1);
    expect(num.get()).toEqual(null);
  });

  it('Underflow', () => {
    const num = new Uint112(0);
    expect(num.get()).toEqual(0n);

    num.subAssign(1);
    expect(num.get()).toEqual(null);
  });
});
