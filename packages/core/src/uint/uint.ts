import invariant from 'tiny-invariant';

export abstract class Uint {
  abstract bits(): bigint;
  abstract clone(): this;

  value: bigint;

  constructor(value: string | number | bigint | boolean | Uint) {
    if (value instanceof Uint) this.value = value.value;
    else this.value = BigInt(value);
    invariant(this.valid(), 'Invalid value');
  }

  private valid(): boolean {
    const maxValue = 2n ** this.bits() - 1n;
    return 0n <= this.value && this.value <= maxValue ? true : false;
  }

  get(): bigint {
    return this.value;
  }

  set(value: string | number | bigint | boolean | Uint) {
    if (value instanceof Uint) this.value = value.value;
    else this.value = BigInt(value);
    invariant(this.valid(), 'Invalid value');
  }

  addAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value += other.value;
    else this.value += BigInt(other);

    invariant(this.valid(), 'Addition out of bounds');
  }

  subAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value -= other.value;
    else this.value -= BigInt(other);

    invariant(this.valid(), 'Subtraction out of bounds');
  }

  mulAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value *= other.value;
    else this.value *= BigInt(other);

    invariant(this.valid(), 'Multiplication out of bounds');
  }

  divAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value /= other.value;
    else this.value /= BigInt(other);

    invariant(this.valid(), 'Division out of bounds');
  }

  modAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value %= other.value;
    else this.value %= BigInt(other);

    invariant(this.valid(), 'Modulus out of bounds');
  }

  shiftLeftAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value <<= other.value;
    else this.value <<= BigInt(other);

    invariant(this.valid(), 'Shift left out of bounds');
  }

  shiftRightAssign(other: string | number | bigint | boolean | Uint) {
    if (other instanceof Uint) this.value >>= other.value;
    else this.value >>= BigInt(other);

    invariant(this.valid(), 'Shift right out of bounds');
  }

  add(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.addAssign(other);
    return result;
  }

  sub(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.subAssign(other);
    return result;
  }

  mul(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.mulAssign(other);
    return result;
  }

  div(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.divAssign(other);
    return result;
  }

  mod(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.modAssign(other);
    return result;
  }

  shiftLeft(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.shiftLeftAssign(other);
    return result;
  }

  shiftRight(other: string | number | bigint | boolean | Uint): this {
    const result = this.clone();
    result.shiftRightAssign(other);
    return result;
  }
}
