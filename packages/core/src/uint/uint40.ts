import { Uint } from './uint';

export class Uint40 extends Uint {
  kind!: 'Uint40';

  bits(): bigint {
    return 40n;
  }

  clone(): this {
    return new Uint40(this.value) as this;
  }
}
