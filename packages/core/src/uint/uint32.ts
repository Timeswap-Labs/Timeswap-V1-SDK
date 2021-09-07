import { Uint } from './uint';

export class Uint32 extends Uint {
  kind!: 'Uint32';

  bits(): bigint {
    return 32n;
  }

  clone(): this {
    return new Uint32(this.value) as this;
  }
}
