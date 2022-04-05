import { Uint } from './uint';

export class Uint112 extends Uint {
  kind!: 'Uint112';

  static readonly bits = 112n;
  static readonly maxValue = (1n << Uint112.bits) - 1n;

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
    return Uint112.bits;
  }

  protected valid(): boolean {
    return 0n <= this.value && this.value <= Uint112.maxValue;
  }

  protected clone(): this {
    return new Uint112(this.value) as this;
  }
}
