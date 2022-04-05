import { Uint256 } from './uint256';

describe('Uint tests', () => {
  it('Construction', () => {
    expect(() => {
      new Uint256(-1);
    }).toThrowError('Invalid value: -1 is an invalid Uint256 value');
  });
});
