import { Uint } from './uint';

export class Uint16 extends Uint {
  kind!: 'Uint16';

  bits(): bigint {
    return 16n;
  }

  clone(): this {
    return new Uint16(this.value) as this;
  }
}
