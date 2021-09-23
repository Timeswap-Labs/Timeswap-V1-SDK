import {
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
} from '@timeswap-labs/timeswap-v1-sdk-core';

import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { TimeswapConvenience__factory } from '../typechain/timeswap';
import type { TimeswapConvenience } from '../typechain/timeswap';
import { ContractTransaction } from 'ethers';
import { CONVENIENCE } from '../constants';

export class Conv {
  protected convContract: TimeswapConvenience;

  constructor(providerOrSigner: Provider | Signer, address?: string) {
    if (address) {
      this.convContract = TimeswapConvenience__factory.connect(
        address,
        providerOrSigner
      );
    } else {
      this.convContract = TimeswapConvenience__factory.connect(
        CONVENIENCE,
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

  contract(): TimeswapConvenience {
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
    return this.convContract.getNative(
      asset.address,
      collateral.address,
      maturity.get()
    );
  }
}

export class ConvSigner extends Conv {
  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    return this.convContract.newLiquidity({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      liquidityTo: params.liquidityTo,
      dueTo: params.dueTo,
      assetIn: params.assetIn.value,
      debtIn: params.debtIn.value,
      collateralIn: params.collateralIn.value,
      deadline: params.deadline.value,
    });
  }

  async newLiquidityETHAsset(
    params: NewLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.newLiquidityETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        liquidityTo: params.liquidityTo,
        dueTo: params.dueTo,
        debtIn: params.debtIn.value,
        collateralIn: params.collateralIn.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async newLiquidityETHCollateral(
    params: NewLiquidityETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.newLiquidityETHCollateral(
      {
        asset: params.asset.address,
        maturity: params.maturity.value,
        liquidityTo: params.liquidityTo,
        dueTo: params.dueTo,
        assetIn: params.assetIn.value,
        debtIn: params.debtIn.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async addLiquidity(params: AddLiquidity): Promise<ContractTransaction> {
    return this.convContract.addLiquidity({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      liquidityTo: params.liquidityTo,
      dueTo: params.dueTo,
      assetIn: params.assetIn.value,
      minLiquidity: params.minLiquidity.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async addLiquidityETHAsset(
    params: AddLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.addLiquidityETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        liquidityTo: params.liquidityTo,
        dueTo: params.dueTo,
        minLiquidity: params.minLiquidity.value,
        maxDebt: params.maxDebt.value,
        maxCollateral: params.maxCollateral.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async addLiquidityETHCollateral(
    params: AddLiquidityETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.addLiquidityETHCollateral(
      {
        asset: params.asset.address,
        maturity: params.maturity.value,
        liquidityTo: params.liquidityTo,
        dueTo: params.dueTo,
        assetIn: params.assetIn.value,
        minLiquidity: params.minLiquidity.value,
        maxDebt: params.maxDebt.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    return this.convContract.removeLiquidity({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async removeLiquidityETHAsset(
    params: RemoveLiquidityETHAsset
  ): Promise<ContractTransaction> {
    return this.convContract.removeLiquidityETHAsset({
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async removeLiquidityETHCollateral(
    params: RemoveLiquidityETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.removeLiquidityETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      liquidityIn: params.liquidityIn.value,
    });
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    return this.convContract.lendGivenBond({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
      assetIn: params.assetIn.value,
      bondOut: params.bondOut.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenBondETHAsset(
    params: LendGivenBondETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenBondETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        bondTo: params.bondTo,
        insuranceTo: params.insuranceTo,
        bondOut: params.bondOut.value,
        minInsurance: params.minInsurance.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async lendGivenBondETHCollateral(
    params: LendGivenBondETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenBondETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
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
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
      assetIn: params.assetIn.value,
      insuranceOut: params.insuranceOut.value,
      minBond: params.minBond.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenInsuranceETHAsset(
    params: LendGivenInsuranceETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        bondTo: params.bondTo,
        insuranceTo: params.insuranceTo,
        insuranceOut: params.insuranceOut.value,
        minBond: params.minBond.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async lendGivenInsuranceETHCollateral(
    params: LendGivenInsuranceETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenInsuranceETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
      assetIn: params.assetIn.value,
      insuranceOut: params.insuranceOut.value,
      minBond: params.minBond.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercent({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
      assetIn: params.assetIn.value,
      percent: params.percent.value,
      minBond: params.minBond.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async lendGivenPercentETHAsset(
    params: LendGivenPercentETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercentETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        bondTo: params.bondTo,
        insuranceTo: params.insuranceTo,
        percent: params.percent.value,
        minBond: params.minBond.value,
        minInsurance: params.minInsurance.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async lendGivenPercentETHCollateral(
    params: LendGivenPercentETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.lendGivenPercentETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      bondTo: params.bondTo,
      insuranceTo: params.insuranceTo,
      assetIn: params.assetIn.value,
      percent: params.percent.value,
      minBond: params.minBond.value,
      minInsurance: params.minInsurance.value,
      deadline: params.deadline.value,
    });
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    return this.convContract.collect({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.insurance.value,
      },
    });
  }

  async collectETHAsset(params: CollectETHAsset): Promise<ContractTransaction> {
    return this.convContract.collectETHAsset({
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.insurance.value,
      },
    });
  }

  async collectETHCollateral(
    params: CollectETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.collectETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      collateralTo: params.collateralTo,
      claimsIn: {
        bond: params.claimsIn.bond.value,
        insurance: params.claimsIn.insurance.value,
      },
    });
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebt({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
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
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
      assetOut: params.assetOut.value,
      debtIn: params.debtIn.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenDebtETHCollateral(
    params: BorrowGivenDebtETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenDebtETHCollateral(
      {
        asset: params.asset.address,
        maturity: params.maturity.value,
        assetTo: params.assetTo,
        dueTo: params.dueTo,
        assetOut: params.assetOut.value,
        debtIn: params.debtIn.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateral({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
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
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
      assetOut: params.assetOut.value,
      collateralIn: params.collateralIn.value,
      maxDebt: params.maxDebt.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenCollateralETHCollateral(
    params: BorrowGivenCollateralETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenCollateralETHCollateral(
      {
        asset: params.asset.address,
        maturity: params.maturity.value,
        assetTo: params.assetTo,
        dueTo: params.dueTo,
        assetOut: params.assetOut.value,
        maxDebt: params.maxDebt.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercent({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
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
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      assetTo: params.assetTo,
      dueTo: params.dueTo,
      assetOut: params.assetOut.value,
      percent: params.percent.value,
      maxDebt: params.maxDebt.value,
      maxCollateral: params.maxCollateral.value,
      deadline: params.deadline.value,
    });
  }

  async borrowGivenPercentETHCollateral(
    params: BorrowGivenPercentETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.borrowGivenPercentETHCollateral(
      {
        asset: params.asset.address,
        maturity: params.maturity.value,
        assetTo: params.assetTo,
        dueTo: params.dueTo,
        assetOut: params.assetOut.value,
        percent: params.percent.value,
        maxDebt: params.maxDebt.value,
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    return this.convContract.repay({
      asset: params.asset.address,
      collateral: params.collateral.address,
      maturity: params.maturity.value,
      collateralTo: params.collateralTo,
      ids: params.ids.map((value) => value.value),
      maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
      deadline: params.deadline.value,
    });
  }

  async repayETHAsset(
    params: RepayETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return this.convContract.repayETHAsset(
      {
        collateral: params.collateral.address,
        maturity: params.maturity.value,
        collateralTo: params.collateralTo,
        ids: params.ids.map((value) => value.value),
        maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
        deadline: params.deadline.value,
      },
      { value: txnParams.value.value }
    );
  }

  async repayETHCollateral(
    params: RepayETHCollateral
  ): Promise<ContractTransaction> {
    return this.convContract.repayETHCollateral({
      asset: params.asset.address,
      maturity: params.maturity.value,
      collateralTo: params.collateralTo,
      ids: params.ids.map((value) => value.value),
      maxAssetsIn: params.maxAssetsIn.map((value) => value.value),
      deadline: params.deadline.value,
    });
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
