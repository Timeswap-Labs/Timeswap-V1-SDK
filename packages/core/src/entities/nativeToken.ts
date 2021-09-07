import { AbstractToken } from './abstractToken';

export class NativeToken extends AbstractToken {
  public readonly isNative: boolean = true;
  public readonly isERC20: boolean = false;
}
