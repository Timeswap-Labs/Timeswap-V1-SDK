import { validateAndParseAddress } from '../helpers/validateAndParseAddress';
import { AbstractToken } from './abstractToken';

export class ERC20Token extends AbstractToken {
  public readonly isNative: boolean = false;
  public readonly isERC20: boolean = true;

  public readonly address: string;

  constructor(
    chainID: number,
    decimals: number,
    address: string,
    symbol?: string,
    name?: string
  ) {
    super(chainID, decimals, symbol, name);
    this.address = validateAndParseAddress(address);
  }
}
