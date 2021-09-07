import {
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
} from '@timeswap-labs/timeswap-v1-sdk-core';

import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { TimeswapConvenience__factory } from '../typechain/timeswap';
import { TimeswapConvenience } from '../typechain/timeswap';
import { ContractTransaction } from 'ethers';
import { CONVENIENCE } from '..';

export class Conv {
  protected providerOrSigner: Provider | Signer;
  protected convContract: TimeswapConvenience;

  constructor(providerOrSigner: Provider | Signer, address?: string) {
    this.providerOrSigner = providerOrSigner;
    if (address) {
      this.convContract = TimeswapConvenience__factory.connect(
        address,
        this.providerOrSigner
      );
    } else {
      this.convContract = TimeswapConvenience__factory.connect(
        CONVENIENCE,
        this.providerOrSigner
      );
    }
  }

  upgrade(signer: Signer): ConvSigner {
    return new ConvSigner(signer);
  }

  getProviderOrSigner(): Provider | Signer {
    return this.providerOrSigner;
  }

  async factory(): Promise<string> {
    return await this.convContract.factory();
  }

  async weth(): Promise<string> {
    return await this.convContract.weth();
  }

  async getNative(
    asset: ERC20Token,
    collateral: ERC20Token,
    maturity: Uint256
  ): Promise<Native> {
    return await this.convContract.getNative(
      asset.address,
      collateral.address,
      maturity.get()
    );
  }
}

export class ConvSigner extends Conv {
  constructor(signer: Signer) {
    super(signer);
  }

  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    return await this.convContract.newLiquidity({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      debtOut: params.debtOut.value,
      collateralIn: params.collateralIn.value,
      deadline: params.deadline.value,
    });
  }

  async newLiquidityETHAsset(
    params: NewLiquidityETHAsset
  ): Promise<ContractTransaction> {
    return await this.convContract.newLiquidityETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      debtOut: params.debtOut.value,
      collateralIn: params.collateralIn.value,
      deadline: params.deadline.value,
    });
  }

  async newLiquidityETHCollateral(
    params: NewLiquidityETHCollateral
  ): Promise<ContractTransaction> {
    return await this.convContract.newLiquidityETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      debtOut: params.debtOut.value,
      deadline: params.deadline.value,
    });
  }

  async addLiquidity(params: AddLiquidity): Promise<ContractTransaction> {
    return await this.convContract.addLiquidity({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      minLiquidity: params.minLiquidity.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async addLiquidityETHAsset(
    params: AddLiquidityETHAsset
  ): Promise<ContractTransaction> {
    return await this.convContract.addLiquidityETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      minLiquidity: params.minLiquidity.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async addLiquidityETHCollateral(
    params: AddLiquidityETHCollateral
  ): Promise<ContractTransaction> {
    return await this.convContract.addLiquidityETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      minLiquidity: params.minLiquidity.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    return await this.convContract.removeLiquidity({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async removeLiquidityETHAsset(
    params: RemoveLiquidityETHAsset
  ): Promise<ContractTransaction> {
    return await this.convContract.removeLiquidityETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async removeLiquidityETHCollateral(
    params: RemoveLiquidityETHCollateral
  ): Promise<ContractTransaction> {
    return await this.convContract.removeLiquidityETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    return await this.convContract.lendGivenBond({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      bondOut: params.bondOut.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenBondETHAsset(
    params: LendGivenBondETHAsset
  ): Promise<ContractTransaction> {
    return await this.convContract.lendGivenBondETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      bondOut: params.bondOut.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenBondETHCollateral(
    params: LendGivenBondETHCollateral
  ): Promise<ContractTransaction> {
    return await this.convContract.lendGivenBondETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      bondOut: params.bondOut.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenInsurance(
    params: LendGivenInsurance
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsurance({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      insuranceOut: params.insuranceOut.value,
      minBond: params.minBond.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenInsuranceETHAsset(
    params: LendGivenInsuranceETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      insuranceOut: params.insuranceOut.value,
      minBond: params.minBond.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenInsuranceETHCollateral(
    params: LendGivenInsuranceETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      insuranceOut: params.insuranceOut.value,
      minBond: params.minBond.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    return await this.convContract.lendGivenPercent({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      percent: params.percent.value,
      minBond: params.minBond.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenPercentETHAsset(
    params: LendGivenPercentETHAsset
  ): Promise<ContractTransaction> {
    return await this.convContract.lendGivenPercentETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      percent: params.percent.value,
      minBond: params.minBond.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenPercentETHCollateral(
    params: LendGivenPercentETHCollateral
  ): Promise<ContractTransaction> {
    return await this.convContract.lendGivenPercentETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetIn: params.assetIn.value,
      percent: params.percent.value,
      minBond: params.minBond.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    return this.convContract.collect({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.bond.value,
      },
    });
  }

  async collectETHAsset(params: CollectETHAsset): Promise<ContractTransaction> {
    return this.convContract.collectETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.bond.value,
      },
    });
  }

  async collectETHCollateral(
    params: CollectETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.collectETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.bond.value,
      },
    });
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebt({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      debtIn: params.debtIn.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenDebtETHAsset(
    params: BorrowGivenDebtETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebtETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      debtIn: params.debtIn.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenDebtETHCollateral(
    params: BorrowGivenDebtETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebtETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      debtIn: params.debtIn.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateral({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      collateralIn: params.collateralIn.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenCollateralETHAsset(
    params: BorrowGivenCollateralETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateralETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      collateralIn: params.collateralIn.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenCollateralETHCollateral(
    params: BorrowGivenCollateralETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateralETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercent({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      percent: params.percent.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenPercentETHAsset(
    params: BorrowGivenPercentETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercentETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      percent: params.percent.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenPercentETHCollateral(
    params: BorrowGivenPercentETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercentETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetOut: params.assetOut.value,
      percent: params.percent.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    return this.convContract.repay({
      ...params,
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      ids: params.ids.map((value) => value.value),
      maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
      deadline: params.deadline.value,
    });
  }

  async repayETHAsset(params: RepayETHAsset): Promise<ContractTransaction> {
    return this.convContract.repayETHAsset({
      ...params,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      ids: params.ids.map((value) => value.value),
      maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
      deadline: params.deadline.value,
    });
  }

  async repayETHCollateral(
    params: RepayETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.repayETHCollateral({
      ...params,
      asset: params.asset.address,
      maturity: params.maturity.value,
      ids: params.ids.map((value) => value.value),
      maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
      deadline: params.deadline.value,
    });
  }
}

// Interface

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
  debtOut: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtOut: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtOut: Uint112;
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