import { Provider } from '@ethersproject/abstract-provider';
import {
  Uint256,
  NativeToken as NativeCore,
} from '@timeswap-labs/timeswap-v1-sdk-core';

export class NativeToken extends NativeCore {
  protected internalProvider: Provider;

  constructor(
    provider: Provider,
    chainID: number,
    decimals: number,
    symbol?: string,
    name?: string
  ) {
    super(chainID, decimals, symbol, name);
    this.internalProvider = provider;
  }

  connect(provider: Provider): this {
    return this.constructor(
      provider,
      this.chainID,
      this.decimals,
      this.symbol,
      this.name
    );
  }

  provider(): Provider {
    return this.internalProvider;
  }

  async getBalance(address: string): Promise<Uint256> {
    const balance = await this.internalProvider.getBalance(address);
    return new Uint256(balance.toString());
  }
}
