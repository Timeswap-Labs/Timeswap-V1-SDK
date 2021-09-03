import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { Uint256 } from '../../';
import { IERC20 } from '../../typechain/timeswap';
import { IERC20Metadata__factory } from '../../typechain/timeswap';

export class ERC20Token {
  protected providerOrSigner: Provider | Signer;
  protected erc20Contract: IERC20;

  constructor(providerOrSigner: Provider | Signer) {
    this.providerOrSigner = providerOrSigner;
    this.erc20Contract = IERC20Metadata__factory.connect(
      CONVENIENCE,
      this.providerOrSigner
    );
  }

  upgrade(signer: Signer): ERC20TokenSigner {
    return new ERC20TokenSigner(signer);
  }

  //view
  async totalSupply(): Promise<Uint256> {
    return new Uint256((await this.erc20Contract.totalSupply()).toString());
  }

  async allowance(owner: string, spender: string): Promise<Uint256> {
    return new Uint256(
      (await this.erc20Contract.allowance(owner, spender)).toString()
    );
  }

  async balanceOf(account: string): Promise<Uint256> {
    return new Uint256(
      (await this.erc20Contract.balanceOf(account)).toString()
    );
  }
}

export class ERC20TokenSigner extends ERC20Token {
  constructor(signer: Signer) {
    super(signer);
  }

  //update
  async approve(spender: string, amount: Uint256) {
    return await this.erc20Contract.approve(spender, amount.value);
  }

  async transfer(recipient: string, amount: Uint256) {
    return await this.erc20Contract.transfer(recipient, amount.value);
  }

  async transferFrom(sender: string, recipient: string, amount: Uint256) {
    return await this.erc20Contract.transferFrom(
      sender,
      recipient,
      amount.value
    );
  }
}
