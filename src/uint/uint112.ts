export class Uint112 {
  value: bigint;
  isValid: boolean;

  constructor(value: string | number | bigint | boolean | Uint112) {
    if (value instanceof Uint112) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint112(this.value);
  }

  get(): bigint | null {
    return this.isValid ? this.value : null;
  }

  set(value: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (value instanceof Uint112) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint112(this.value);
    // }
  }

  add(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.addAssign(other);

    return result;
  }

  addAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value += other.value;
    else this.value += BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  sub(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.subAssign(other);

    return result;
  }

  subAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value -= other.value;
    else this.value -= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  mul(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.mulAssign(other);

    return result;
  }

  mulAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value *= other.value;
    else this.value *= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  div(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.divAssign(other);

    return result;
  }

  divAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value /= other.value;
    else this.value /= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  mod(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.modAssign(other);

    return result;
  }

  modAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value %= other.value;
    else this.value %= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  shiftLeft(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.shiftLeftAssign(other);

    return result;
  }

  shiftLeftAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value <<= other.value;
    else this.value <<= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }

  shiftRight(other: string | number | bigint | boolean | Uint112): Uint112 {
    const result = new Uint112(this.value);
    result.shiftRightAssign(other);

    return result;
  }

  shiftRightAssign(other: string | number | bigint | boolean | Uint112) {
    // if (this.isValid) {
    if (other instanceof Uint112) this.value >>= other.value;
    else this.value >>= BigInt(other);

    this.isValid = isUint112(this.value);
    // }
  }
}

function isUint112(value: bigint): boolean {
  return 0 <= value && value <= MAX_UINT_112 ? true : false;
}

export const MAX_UINT_112: bigint = 2n ** 112n - 1n;
