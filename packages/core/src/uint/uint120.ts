import { Uint } from './uint';

export class Uint120 extends Uint {
  kind!: 'Uint120';

  static readonly bits = 120n;
  static readonly maxValue = (1n << Uint120.bits) - 1n;

  static check(other: string | number | bigint | boolean | Uint): boolean {
    if (other instanceof Uint) {
      const temp = other.toBigInt();
      return 0n <= temp && temp <= this.maxValue;
    } else {
      const temp = BigInt(other);
      return 0n <= temp && temp <= this.maxValue;
    }
  }

  protected valid(): boolean {
    return 0n <= this.value && this.value <= Uint120.maxValue ? true : false;
  }

  protected clone(): this {
    return new Uint120(this.value) as this;
  }
}
