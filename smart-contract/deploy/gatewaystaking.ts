import { addContractToAdmin, getDeploymentSigner, sleep, verify } from "./defender-utils";
import { ethers , upgrades } from 'hardhat';
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BNB_MAINNET_CONTRACT_ADDRESSES } from "./utils";

async function main() {
    const testnetTokenContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.erc20;

    const args = [testnetTokenContractAddress , 'Identity Test Staking Vault', "ID_TEST_STAKE"];
    
    const signer: Signer = await getDeploymentSigner();
    const signerAddress = await signer.getAddress();

    const GatewayStakingContractFactory = await ethers.getContractFactory("GatewayStaking", signer!);

    const gatewayStakingContract = await upgrades.deployProxy(GatewayStakingContractFactory, [signerAddress], 
        { 
            kind: 'uups', 
            constructorArgs: args ,
            unsafeAllow: ['state-variable-immutable', 'constructor']
        });

    await gatewayStakingContract.deployed();
    const deployedAddress = gatewayStakingContract.address;

    console.log(`GatewayStaking deployed at ${deployedAddress}`);

    await sleep(6000);

    await verify(deployedAddress,args);

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

