import { Uint } from './uint';

export class Uint128 extends Uint {
  kind!: 'Uint128';

  bits(): bigint {
    return 128n;
  }

  clone(): this {
    return new Uint128(this.value) as this;
  }
}
