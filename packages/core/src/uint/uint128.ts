import { Uint } from './uint';

export class Uint128 extends Uint {
  kind!: 'Uint128';

  static readonly bits = 128n;
  static readonly maxValue = (1n << Uint128.bits) - 1n;

  static check(other: string | number | bigint | boolean | Uint): boolean {
    if (other instanceof Uint) {
      const temp = other.toBigInt();
      return 0n <= temp && temp <= this.maxValue;
    } else {
      const temp = BigInt(other);
      return 0n <= temp && temp <= this.maxValue;
    }
  }

  protected bits(): bigint {
    return Uint128.bits;
  }

  protected valid(): boolean {
    return 0n <= this.value && this.value <= Uint128.maxValue;
  }

  protected clone(): this {
    return new Uint128(this.value) as this;
  }
}
