import { Uint } from './uint';

export class Uint112 extends Uint {
  kind!: 'Uint112';

  bits(): bigint {
    return 112n;
  }

  clone(): this {
    return new Uint112(this.value) as this;
  }
}
