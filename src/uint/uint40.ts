export class Uint40 {
  value: bigint;
  isValid: boolean;

  constructor(value: string | number | bigint | boolean) {
    this.value = BigInt(value);
    this.isValid = isUint40(this.value);
  }

  get(): bigint | null {
    return this.isValid ? this.value : null;
  }

  set(value: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value = BigInt(value);
      this.isValid = isUint40(this.value);
    }
  }

  add(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.addAssign(other);

    return result;
  }

  addAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value += BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }

  sub(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.subAssign(other);

    return result;
  }

  subAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value -= BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }

  mul(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.mulAssign(other);

    return result;
  }

  mulAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value *= BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }

  div(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.divAssign(other);

    return result;
  }

  divAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value /= BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }

  shiftLeft(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.shiftLeftAssign(other);

    return result;
  }

  shiftLeftAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value <<= BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }

  shiftRight(other: string | number | bigint | boolean): Uint40 {
    const result = new Uint40(this.value);
    result.shiftRightAssign(other);

    return result;
  }

  shiftRightAssign(other: string | number | bigint | boolean) {
    if (this.isValid) {
      this.value >>= BigInt(other);
      this.isValid = isUint40(this.value);
    }
  }
}

function isUint40(value: bigint): boolean {
  return 0 <= value && value <= MAX_UINT_40 ? true : false;
}

export const MAX_UINT_40: bigint = 2n ** 40n - 1n;
