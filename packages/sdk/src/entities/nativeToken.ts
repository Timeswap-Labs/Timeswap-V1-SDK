import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import {
  Uint256,
  NativeToken as NativeCore,
} from '@timeswap-labs/timeswap-v1-sdk-core';

export class NativeToken extends NativeCore {
  protected providerOrSigner: Provider | Signer;

  constructor(
    providerOrSigner: Provider | Signer,
    chainID: number,
    decimals: number,
    symbol?: string,
    name?: string
  ) {
    super(chainID, decimals, symbol, name);

    this.providerOrSigner = providerOrSigner;
  }

  async getBalance(address: string): Promise<Uint256> {
    const balance = await this.providerOrSigner.getBalance(address);
    return new Uint256(balance.toString());
  }
}
