import {
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
} from '@timeswap-labs/timeswap-v1-sdk-core';

import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { CONVENIENCE } from '../constants';
import convenienceAbi from '../abi/convenience';

export class Conv {
  protected convContract: Contract;

  constructor(providerOrSigner: Provider | Signer, address?: string) {
    if (address) {
      this.convContract = new Contract(
        address,
        convenienceAbi,
        providerOrSigner
      );
    } else {
      this.convContract = new Contract(
        CONVENIENCE,
        convenienceAbi,
        providerOrSigner
      );
    }
  }

  address(): string {
    return this.convContract.address;
  }

  connect(providerOrSigner: Provider | Signer): this {
    return this.constructor(providerOrSigner, this.convContract.address);
  }

  upgrade(signer: Signer): ConvSigner {
    return new ConvSigner(signer, this.convContract.address);
  }

  provider(): Provider {
    return this.convContract.provider;
  }

  signer(): Signer {
    return this.convContract.signer;
  }

  contract(): Contract {
    return this.convContract;
  }

  async factory(): Promise<string> {
    return this.convContract.factory();
  }

  async weth(): Promise<string> {
    return this.convContract.weth();
  }

  async getNative(
    asset: ERC20Token,
    collateral: ERC20Token,
    maturity: Uint256
  ): Promise<Native> {
    const native = await this.convContract.getNative(
      asset.address,
      collateral.address,
      maturity.value
    );

    return {
      liquidity: native[0],
      bond: native[1],
      insurance: native[2],
      collateralizedDebt: native[3],
    };
  }
}

export class ConvSigner extends Conv {
  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    return this.convContract.newLiquidity([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.liquidityTo,
      params.dueTo,
      params.assetIn.value,
      params.debtIn.value,
      params.collateralIn.value,
      params.deadline.value,
    ]);
  }

  async newLiquidityETHAsset(
    params: NewLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.newLiquidityETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.liquidityTo,
        params.dueTo,
        params.debtIn.value,
        params.collateralIn.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async newLiquidityETHCollateral(
    params: NewLiquidityETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.newLiquidityETHCollateral(
      [
        params.asset.address,
        params.maturity.value,
        params.liquidityTo,
        params.dueTo,
        params.assetIn.value,
        params.debtIn.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async addLiquidity(params: AddLiquidity): Promise<ContractTransaction> {
    return this.convContract.addLiquidity([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.liquidityTo,
      params.dueTo,
      params.assetIn.value,
      params.minLiquidity.value,
      params.maxDebt.value,
      params.maxCollateral.value,
      params.deadline.value,
    ]);
  }

  async addLiquidityETHAsset(
    params: AddLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.addLiquidityETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.liquidityTo,
        params.dueTo,
        params.minLiquidity.value,
        params.maxDebt.value,
        params.maxCollateral.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async addLiquidityETHCollateral(
    params: AddLiquidityETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.addLiquidityETHCollateral(
      [
        params.asset.address,
        params.maturity.value,
        params.liquidityTo,
        params.dueTo,
        params.assetIn.value,
        params.minLiquidity.value,
        params.maxDebt.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    return this.convContract.removeLiquidity([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      params.liquidityIn.value,
    ]);
  }

  async removeLiquidityETHAsset(
    params: RemoveLiquidityETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.removeLiquidityETHAsset([
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      params.liquidityIn.value,
    ]);
  }

  async removeLiquidityETHCollateral(
    params: RemoveLiquidityETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.removeLiquidityETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      params.liquidityIn.value,
    ]);
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    return this.convContract.lendGivenBond([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.bondOut.value,
      params.minInsurance.value,
      params.deadline.value,
    ]);
  }

  async lendGivenBondETHAsset(
    params: LendGivenBondETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenBondETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.bondTo,
        params.insuranceTo,
        params.bondOut.value,
        params.minInsurance.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async lendGivenBondETHCollateral(
    params: LendGivenBondETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenBondETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.bondOut.value,
      params.minInsurance.value,
      params.deadline.value,
    ]);
  }

  async lendGivenInsurance(
    params: LendGivenInsurance
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsurance([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.insuranceOut.value,
      params.minBond.value,
      params.deadline.value,
    ]);
  }

  async lendGivenInsuranceETHAsset(
    params: LendGivenInsuranceETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.bondTo,
        params.insuranceTo,
        params.insuranceOut.value,
        params.minBond.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async lendGivenInsuranceETHCollateral(
    params: LendGivenInsuranceETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.insuranceOut.value,
      params.minBond.value,
      params.deadline.value,
    ]);
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercent([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.percent.value,
      params.minBond.value,
      params.minInsurance.value,
      params.deadline.value,
    ]);
  }

  async lendGivenPercentETHAsset(
    params: LendGivenPercentETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercentETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.bondTo,
        params.insuranceTo,
        params.percent.value,
        params.minBond.value,
        params.minInsurance.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async lendGivenPercentETHCollateral(
    params: LendGivenPercentETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercentETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.bondTo,
      params.insuranceTo,
      params.assetIn.value,
      params.percent.value,
      params.minBond.value,
      params.minInsurance.value,
      params.deadline.value,
    ]);
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    return this.convContract.collect([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      [params.claimsIn.bond.value, params.claimsIn.insurance.value],
    ]);
  }

  async collectETHAsset(params: CollectETHAsset): Promise<ContractTransaction> {
    return this.convContract.collectETHAsset([
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      [params.claimsIn.bond.value, params.claimsIn.insurance.value],
    ]);
  }

  async collectETHCollateral(
    params: CollectETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.collectETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.assetTo,
      params.collateralTo,
      [params.claimsIn.bond.value, params.claimsIn.insurance.value],
    ]);
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebt([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.debtIn.value,
      params.maxCollateral.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenDebtETHAsset(
    params: BorrowGivenDebtETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebtETHAsset([
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.debtIn.value,
      params.maxCollateral.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenDebtETHCollateral(
    params: BorrowGivenDebtETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebtETHCollateral(
      [
        params.asset.address,
        params.maturity.value,
        params.assetTo,
        params.dueTo,
        params.assetOut.value,
        params.debtIn.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateral([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.collateralIn.value,
      params.maxDebt.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenCollateralETHAsset(
    params: BorrowGivenCollateralETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateralETHAsset([
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.collateralIn.value,
      params.maxDebt.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenCollateralETHCollateral(
    params: BorrowGivenCollateralETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateralETHCollateral(
      [
        params.asset.address,
        params.maturity.value,
        params.assetTo,
        params.dueTo,
        params.assetOut.value,
        params.maxDebt.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercent([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.percent.value,
      params.maxDebt.value,
      params.maxCollateral.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenPercentETHAsset(
    params: BorrowGivenPercentETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercentETHAsset([
      params.collateral.address,
      params.maturity.value,
      params.assetTo,
      params.dueTo,
      params.assetOut.value,
      params.percent.value,
      params.maxDebt.value,
      params.maxCollateral.value,
      params.deadline.value,
    ]);
  }

  async borrowGivenPercentETHCollateral(
    params: BorrowGivenPercentETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercentETHCollateral(
      [
        params.asset.address,
        params.maturity.value,
        params.assetTo,
        params.dueTo,
        params.assetOut.value,
        params.percent.value,
        params.maxDebt.value,
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    return this.convContract.repay([
      params.asset.address,
      params.collateral.address,
      params.maturity.value,
      params.collateralTo,
      params.ids.map(value => value.value),
      params.maxAssetsIn.map(value => value.value),
      params.deadline.value,
    ]);
  }

  async repayETHAsset(
    params: RepayETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.repayETHAsset(
      [
        params.collateral.address,
        params.maturity.value,
        params.collateralTo,
        params.ids.map(value => value.value),
        params.maxAssetsIn.map(value => value.value),
        params.deadline.value,
      ],
      { value: txnParams.value.value }
    );
  }

  async repayETHCollateral(
    params: RepayETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.repayETHCollateral([
      params.asset.address,
      params.maturity.value,
      params.collateralTo,
      params.ids.map(value => value.value),
      params.maxAssetsIn.map(value => value.value),
      params.deadline.value,
    ]);
  }
}

// Interface

interface TransactionParams {
  value: Uint112;
}

interface Native {
  liquidity: string;
  bond: string;
  insurance: string;
  collateralizedDebt: string;
}

interface NewLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  deadline: Uint256;
}

interface AddLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface AddLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface AddLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface RemoveLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface RemoveLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface RemoveLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}
interface LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenBondETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenBondETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenInsuranceETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenInsuranceETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface Collect {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

interface BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenDebtETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenDebtETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateralETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateralETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface Repay {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface RepayETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface RepayETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
