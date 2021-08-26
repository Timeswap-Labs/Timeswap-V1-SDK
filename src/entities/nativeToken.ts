import { AbstractToken } from './abstractToken';

export abstract class NativeToken extends AbstractToken {
  public readonly isNative: boolean = true;
  public readonly isERC20: boolean = false;
}
