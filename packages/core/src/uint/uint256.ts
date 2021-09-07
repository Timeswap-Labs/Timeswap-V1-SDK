import { Uint } from './uint';

export class Uint256 extends Uint {
  kind!: 'Uint256';

  bits(): bigint {
    return 256n;
  }

  clone(): this {
    return new Uint256(this.value) as this;
  }
}
