import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import {
  Uint256,
  ERC20Token as ERC20Core,
} from '@timeswap-labs/timeswap-v1-sdk-core';
import type { Erc20 } from '../typechain/abi';
import { Erc20__factory } from '../typechain/abi';
import { ContractTransaction } from 'ethers';

export class ERC20Token extends ERC20Core {
  protected providerOrSigner: Provider | Signer;
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

    this.providerOrSigner = providerOrSigner;
    this.erc20Contract = Erc20__factory.connect(address, this.providerOrSigner);
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

  //view
  async getName(): Promise<string> {
    return await this.erc20Contract.name();
  }

  async getSymbol(): Promise<string> {
    return await this.erc20Contract.symbol();
  }

  async getDecimals(): Promise<number> {
    return await this.erc20Contract.decimals();
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
  constructor(
    signer: Signer,
    chainID: number,
    decimals: number,
    address: string,
    symbol?: string,
    name?: string
  ) {
    super(signer, chainID, decimals, address, symbol, name);
  }

  //update
  async approve(
    spender: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return await this.erc20Contract.approve(spender, amount.value);
  }

  async transfer(
    recipient: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return await this.erc20Contract.transfer(recipient, amount.value);
  }

  async transferFrom(
    sender: string,
    recipient: string,
    amount: Uint256
  ): Promise<ContractTransaction> {
    return await this.erc20Contract.transferFrom(
      sender,
      recipient,
      amount.value
    );
  }
}
