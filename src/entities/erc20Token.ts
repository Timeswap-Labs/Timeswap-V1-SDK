import { AbstractToken } from './abstractToken';

export class ERC20Token extends AbstractToken {
  public readonly isNative: boolean = false;
  public readonly isERC20: boolean = true;

  public readonly address: string;

  constructor(chainID: number, decimals: number, address: string) {
    super(chainID, decimals);
    this.address = address;
  }
}
