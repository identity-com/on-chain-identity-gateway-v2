import { addContractToAdmin, sleep, verify, getDeploymentSigner } from "./defender-utils";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { ethers, upgrades } from 'hardhat';
import { BNB_MAINNET_CONTRACT_ADDRESSES } from "./utils";


async function main() {
    const testnetGatekeeperContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatekeeper;
    const testnetStakingContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayStaking;

    const signer: Signer = await getDeploymentSigner();
    const signerAddress = await signer.getAddress();

    const args = [signerAddress, testnetGatekeeperContractAddress, testnetStakingContractAddress];
        

    const GatewayNetworkContractFactory = await ethers.getContractFactory("GatewayNetwork", signer!);
    const gatewayNetworkContract = await upgrades.deployProxy(GatewayNetworkContractFactory, args, {kind: 'uups'});

    await gatewayNetworkContract.deployed();
    const deployedAddress = gatewayNetworkContract.address;

    console.log(`GatewayNetwork deployed at ${deployedAddress}`);

    await sleep(6000);

    await verify(deployedAddress,[]);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

