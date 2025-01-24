import { addContractToAdmin, sleep, getDeploymentSigner } from "./defender-utils";
import { Signer } from '@ethersproject/abstract-signer/src.ts'

import hre , { ethers, upgrades } from "hardhat";

async function main() {
    const signer: Signer = await getDeploymentSigner();

    const ChargeHandler = await ethers.getContractFactory("ChargeHandler", signer!);

    const chargeHandler = await upgrades.deployProxy(ChargeHandler, [process.env.BSC_TESTNET_RELAYER!],
        {
            kind: "uups",
            redeployImplementation: "always"
        });

    const deployedAddress = chargeHandler.address;


    await sleep(6000);

    await hre.run("verify:verify", {
        address: deployedAddress,
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

