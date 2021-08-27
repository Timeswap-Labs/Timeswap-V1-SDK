export class Uint128 {
  value: bigint;
  isValid: boolean;

  constructor(value: string | number | bigint | boolean | Uint128) {
    if (value instanceof Uint128) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint128(this.value);
  }

  get(): bigint | null {
    return this.isValid ? this.value : null;
  }

  set(value: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (value instanceof Uint128) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint128(this.value);
    // }
  }

  add(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.addAssign(other);

    return result;
  }

  addAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value += other.value;
    else this.value += BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  sub(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.subAssign(other);

    return result;
  }

  subAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value -= other.value;
    else this.value -= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  mul(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.mulAssign(other);

    return result;
  }

  mulAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value *= other.value;
    else this.value *= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  div(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.divAssign(other);

    return result;
  }

  divAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value /= other.value;
    else this.value /= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  mod(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.modAssign(other);

    return result;
  }

  modAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value %= other.value;
    else this.value %= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  shiftLeft(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.shiftLeftAssign(other);

    return result;
  }

  shiftLeftAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value <<= other.value;
    else this.value <<= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }

  shiftRight(other: string | number | bigint | boolean | Uint128): Uint128 {
    const result = new Uint128(this.value);
    result.shiftRightAssign(other);

    return result;
  }

  shiftRightAssign(other: string | number | bigint | boolean | Uint128) {
    // if (this.isValid) {
    if (other instanceof Uint128) this.value >>= other.value;
    else this.value >>= BigInt(other);

    this.isValid = isUint128(this.value);
    // }
  }
}

function isUint128(value: bigint): boolean {
  return 0 <= value && value <= MAX_UINT_128 ? true : false;
}

export const MAX_UINT_128: bigint = 2n ** 128n - 1n;
