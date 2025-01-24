import { sleep, getDeploymentSigner } from "./defender-utils";
import hre , { ethers, upgrades } from "hardhat";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BNB_MAINNET_CONTRACT_ADDRESSES } from "./utils";

async function main() {    
    const signer: Signer = await getDeploymentSigner();

    const gatewayNetworkContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayNetwork;
    const gatekeeperContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatekeeper;
    const gatewayStakingContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayStaking;
    const chargeHandlerContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.chargeHandler;
    const flagsStorageContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.flagsStorage;
    const superAdmin = process.env.BSC_TESTNET_RELAYER!;
    const name = "Gateway Token";
    const symbol = "GWTK";

    const args = [name, symbol, superAdmin, flagsStorageContractAddress, chargeHandlerContractAddress,[],gatewayNetworkContractAddress,gatekeeperContractAddress,gatewayStakingContractAddress];

    const GatewayToken = await ethers.getContractFactory("GatewayToken", signer!);

    const gatewayToken = await upgrades.deployProxy(GatewayToken, args,
        {
            kind: "uups",
            redeployImplementation: "always"
        });

    const deployedAddress = gatewayToken.address;


    await sleep(6000);

    await hre.run("verify:verify", {
        address: deployedAddress,
    });

    // Need to wait to avoid rate limit
    await sleep(2000);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

