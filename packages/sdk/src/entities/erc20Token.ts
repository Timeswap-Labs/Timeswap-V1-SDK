import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import {
  Uint256,
  ERC20Token as ERC20Core,
} from '@timeswap-labs/timeswap-v1-sdk-core';
import type { Erc20 } from '../typechain/abi';
import { Erc20__factory } from '../typechain/abi';
import { ContractTransaction } from 'ethers';

export class ERC20Token extends ERC20Core {
  protected erc20Contract: Erc20;

  constructor(
    providerOrSigner: Provider | Signer,
    chainID: number,
    decimals: number,
    address: string,
    symbol?: string,
    name?: string
  ) {
    super(chainID, decimals, address, symbol, name);
    this.erc20Contract = Erc20__factory.connect(address, providerOrSigner);
  }

  connect(providerOrSigner: Provider | Signer): this {
    return this.constructor(
      providerOrSigner,
      this.chainID,
      this.decimals,
      this.address,
      this.symbol,
      this.name
    );
  }

  upgrade(signer: Signer): ERC20TokenSigner {
    return new ERC20TokenSigner(
      signer,
      this.chainID,
      this.decimals,
      this.address,
      this.symbol,
      this.name
    );
  }

  provider(): Provider {
    return this.erc20Contract.provider;
  }

  signer(): Signer {
    return this.erc20Contract.signer;
  }

  async getName(): Promise<string> {
    return this.erc20Contract.name();
  }

  async getSymbol(): Promise<string> {
    return this.erc20Contract.symbol();
  }

  async getDecimals(): Promise<number> {
    return this.erc20Contract.decimals();
  }

  async totalSupply(): Promise<Uint256> {
    const totalSupply = await this.erc20Contract.totalSupply();
    return new Uint256(totalSupply.toString());
  }

  async allowance(owner: string, spender: string): Promise<Uint256> {
    const allowance = await this.erc20Contract.allowance(owner, spender);
    return new Uint256(allowance.toString());
  }

  async balanceOf(account: string): Promise<Uint256> {
    const balanceOf = await this.erc20Contract.balanceOf(account);
    return new Uint256(balanceOf.toString());
  }
}

export class ERC20TokenSigner extends ERC20Token {
  async approve(
    spender: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return this.erc20Contract.approve(spender, amount.value);
  }

  async transfer(
    recipient: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return this.erc20Contract.transfer(recipient, amount.value);
  }

  async transferFrom(
    sender: string,
    recipient: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return this.erc20Contract.transferFrom(sender, recipient, amount.value);
  }
}
