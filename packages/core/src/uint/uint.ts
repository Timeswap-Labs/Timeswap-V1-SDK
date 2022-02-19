import invariant from 'tiny-invariant';

type Uintable = string | number | bigint | boolean | Uint;

export abstract class Uint {
  protected abstract valid(): boolean;
  protected abstract clone(): this;

  protected value: bigint;

  constructor(value: Uintable) {
    this.value = toBigInt(value);
    invariant(this.valid(), 'Invalid value');
  }

  toBigInt(): bigint {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  set(value: Uintable) {
    this.value = toBigInt(value);
    invariant(this.valid(), 'Invalid value');
  }

  addAssign(other: Uintable) {
    this.value += toBigInt(other);
    invariant(this.valid(), 'Addition out of bounds');
  }

  subAssign(other: Uintable) {
    this.value -= toBigInt(other);
    invariant(this.valid(), 'Subtraction out of bounds');
  }

  mulAssign(other: Uintable) {
    this.value *= toBigInt(other);
    invariant(this.valid(), 'Multiplication out of bounds');
  }

  divAssign(other: Uintable) {
    this.value /= toBigInt(other);
    invariant(this.valid(), 'Division out of bounds');
  }

  modAssign(other: Uintable) {
    this.value %= toBigInt(other);
    invariant(this.valid(), 'Modulus out of bounds');
  }

  powAssign(other: Uintable) {
    const value = toBigInt(other);
    let result = 1n;
    for (let i = 0n; i < value; i++, result *= this.value);
    this.value = result;
    invariant(this.valid(), 'Power out of bounds');
  }

  shlAssign(other: Uintable) {
    this.value <<= toBigInt(other);
    invariant(this.valid(), 'Shift left out of bounds');
  }

  shrAssign(other: Uintable) {
    this.value >>= toBigInt(other);
    invariant(this.valid(), 'Shift right out of bounds');
  }

  add(other: Uintable): this {
    const result = this.clone();
    result.addAssign(other);
    return result;
  }

  sub(other: Uintable): this {
    const result = this.clone();
    result.subAssign(other);
    return result;
  }

  mul(other: Uintable): this {
    const result = this.clone();
    result.mulAssign(other);
    return result;
  }

  div(other: Uintable): this {
    const result = this.clone();
    result.divAssign(other);
    return result;
  }

  mod(other: Uintable): this {
    const result = this.clone();
    result.modAssign(other);
    return result;
  }

  pow(other: Uintable): this {
    const result = this.clone();
    result.powAssign(other);
    return result;
  }

  shl(other: Uintable): this {
    const result = this.clone();
    result.shlAssign(other);
    return result;
  }

  shr(other: Uintable): this {
    const result = this.clone();
    result.shrAssign(other);
    return result;
  }

  eq(other: Uintable): boolean {
    return this.value === toBigInt(other);
  }

  ne(other: Uintable): boolean {
    return this.value !== toBigInt(other);
  }

  gt(other: Uintable): boolean {
    return this.value > toBigInt(other);
  }

  gte(other: Uintable): boolean {
    return this.value >= toBigInt(other);
  }

  lt(other: Uintable): boolean {
    return this.value < toBigInt(other);
  }

  lte(other: Uintable): boolean {
    return this.value <= toBigInt(other);
  }
}

function toBigInt(value: Uintable): bigint {
  if (value instanceof Uint) return value.toBigInt();
  else return BigInt(value);
}
