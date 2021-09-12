import { Uint } from './uint';

export class Uint120 extends Uint {
  kind!: 'Uint120';

  bits(): bigint {
    return 120n;
  }

  clone(): this {
    return new Uint120(this.value) as this;
  }
}
