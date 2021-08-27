export class Uint16 {
  value: bigint;
  isValid: boolean;

  constructor(value: string | number | bigint | boolean | Uint16) {
    if (value instanceof Uint16) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint16(this.value);
  }

  get(): bigint | null {
    return this.isValid ? this.value : null;
  }

  set(value: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (value instanceof Uint16) this.value = value.value;
    else this.value = BigInt(value);

    this.isValid = isUint16(this.value);
    // }
  }

  add(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.addAssign(other);

    return result;
  }

  addAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value += other.value;
    else this.value += BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  sub(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.subAssign(other);

    return result;
  }

  subAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value -= other.value;
    else this.value -= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  mul(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.mulAssign(other);

    return result;
  }

  mulAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value *= other.value;
    else this.value *= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  div(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.divAssign(other);

    return result;
  }

  divAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value /= other.value;
    else this.value /= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  mod(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.modAssign(other);

    return result;
  }

  modAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value %= other.value;
    else this.value %= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  shiftLeft(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.shiftLeftAssign(other);

    return result;
  }

  shiftLeftAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value <<= other.value;
    else this.value <<= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }

  shiftRight(other: string | number | bigint | boolean | Uint16): Uint16 {
    const result = new Uint16(this.value);
    result.shiftRightAssign(other);

    return result;
  }

  shiftRightAssign(other: string | number | bigint | boolean | Uint16) {
    // if (this.isValid) {
    if (other instanceof Uint16) this.value >>= other.value;
    else this.value >>= BigInt(other);

    this.isValid = isUint16(this.value);
    // }
  }
}

function isUint16(value: bigint): boolean {
  return 0 <= value && value <= MAX_UINT_16 ? true : false;
}

export const MAX_UINT_16: bigint = 2n ** 16n - 1n;
