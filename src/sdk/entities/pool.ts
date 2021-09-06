import { Signer } from '@ethersproject/abstract-signer';
import { ContractTransaction } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import {
  AbstractToken,
  ERC20Token,
  NativeToken,
  Due as DueCalculated,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint40,
} from '../..'; //from sdk-core
import { Pair, PairSigner } from './pair';

export class Pool {
  protected pair: Pair;

  readonly asset: NativeToken | ERC20Token;
  readonly collateral: NativeToken | ERC20Token;
  readonly maturity: Uint256;

  protected cache?: {
    state: State;
    fee: Uint16;
  };

  public constructor(
    providerOrSigner: Provider | Signer,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    maturity: Uint256,
    convAddress?: string
  ) {
    this.pair = new Pair(providerOrSigner, asset, collateral, convAddress);

    this.asset = this.pair.asset;
    this.collateral = this.pair.collateral;
    this.maturity = maturity;
  }

  upgrade(signer: Signer): PoolSigner {
    return new PoolSigner(signer, this.asset, this.collateral, this.maturity);
  }

  async initPair() {
    await this.pair.initPair();
  }

  async updateCache() {
    if (this.cache) {
      this.cache.state = await this.getState();
    } else {
      this.cache = { state: await this.getState(), fee: await this.getFee() };
    }
  }

  async getFee(): Promise<Uint16> {
    return await this.pair.getFee();
  }

  async getProtocolFee(): Promise<Uint16> {
    return await this.pair.getProtocolFee();
  }

  async getState(): Promise<State> {
    return await this.pair.getState(this.maturity);
  }

  async getTotalLocked(): Promise<Tokens> {
    return await this.pair.getTotalLocked(this.maturity);
  }

  async getTotalLiquidity(): Promise<Uint256> {
    return await this.pair.getTotalLiquidity(this.maturity);
  }

  async getLiquidityOf(address: string): Promise<Uint256> {
    return await this.pair.getLiquidityOf(this.maturity, address);
  }

  async getTotalClaims(): Promise<Claims> {
    return await this.pair.getTotalClaims(this.maturity);
  }

  async getClaimsOf(address: string): Promise<Claims> {
    return await this.pair.getClaimsOf(this.maturity, address);
  }

  async getDuesOf(address: string): Promise<Due[]> {
    return await this.pair.getDuesOf(this.maturity, address);
  }

  async getNative(): Promise<Native> {
    return await this.pair.getNative(this.maturity);
  }

  async calculateApr() {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateApr(this.cache!.state);
  }

  async calculateCf() {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateCf(this.cache!.state);
  }

  async calculateNewLiquidity(
    assetIn: Uint112,
    debtOut: Uint112,
    collateralIn: Uint112 // : Promise<{ liquidityOut: Uint256; dueOut: DueCalculated }>
  ) {
    if (!this.cache) await this.updateCache();
  }

  async calculateLendGivenBond(
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256
  ): Promise<Claims> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenBond(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      bondOut,
      this.maturity,
      now
    );
  }

  async calculateLendGivenInsurance(
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256
  ): Promise<Claims> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenInsurance(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      insuranceOut,
      this.maturity,
      now
    );
  }

  async calculateLendGivenPercent(
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256
  ): Promise<Claims> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenPercent(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      percent,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenDebt(
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256
  ): Promise<DueCalculated> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenDebt(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      debtIn,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenCollateral(
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): Promise<DueCalculated> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenCollateral(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      collateralIn,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenPercent(
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256
  ): Promise<DueCalculated> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenPercent(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      percent,
      this.maturity,
      now
    );
  }
}

export class PoolSigner extends Pool {
  protected pairSigner: PairSigner;

  constructor(
    signer: Signer,
    asset: AbstractToken,
    collateral: AbstractToken,
    maturity: Uint256
  ) {
    super(signer, asset, collateral, maturity);
    this.pairSigner = this.pair.upgrade(signer);
  }

  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    return await this.pairSigner.newLiquidity({
      ...params,
      maturity: this.maturity,
    });
  }

  async addLiquidity(params: AddLiquidity): Promise<ContractTransaction> {
    return await this.pairSigner.addLiquidity({
      ...params,
      maturity: this.maturity,
    });
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    return await this.pairSigner.removeLiquidity({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    return await this.pairSigner.lendGivenBond({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenInsurance(
    params: LendGivenInsurance
  ): Promise<ContractTransaction> {
    return await this.pairSigner.lendGivenInsurance({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    return await this.pairSigner.lendGivenPercent({
      ...params,
      maturity: this.maturity,
    });
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    return await this.pairSigner.collect({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    return await this.pairSigner.borrowGivenDebt({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    return await this.pairSigner.borrowGivenCollateral({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    return await this.pairSigner.borrowGivenPercent({
      ...params,
      maturity: this.maturity,
    });
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    return await this.pairSigner.repay({
      ...params,
      maturity: this.maturity,
    });
  }
}

interface Tokens {
  asset: Uint128;
  collateral: Uint128;
}

interface State {
  asset: Uint112;
  interest: Uint112;
  cdp: Uint112;
}

interface Due {
  debt: Uint112;
  collateral: Uint112;
  startBlock: Uint32;
}

interface Native {
  liquidity: string;
  bond: string;
  insurance: string;
  collateralizedDebt: string;
}
interface NewLiquidity {
  liquidityTo: string;
  dueTo: string;
  assetIn?: Uint112;
  debtOut: Uint112;
  collateralIn?: Uint112;
  deadline: Uint256;
}

interface _NewLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  assetFrom: string;
  collateralFrom: string;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtOut: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface AddLiquidity {
  liquidityTo: string;
  dueTo: string;
  assetIn?: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _AddLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;

  assetFrom: string;
  collateralFrom: string;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface RemoveLiquidity {
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface LendGivenBond {
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface _LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}
interface Collect {
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

interface BorrowGivenDebt {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface BorrowGivenCollateral {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn?: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercent {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface Repay {
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface _Repay {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
