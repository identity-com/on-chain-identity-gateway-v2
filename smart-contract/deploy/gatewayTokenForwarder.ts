import { addContractToAdmin, sleep, verify, getDeploymentSigner } from "./defender-utils";
import { ethers } from 'hardhat';
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BigNumber } from "ethers";

async function main() {
    const signer: Signer = await getDeploymentSigner();

    const forwardedSignatureExpirationInBlocks = BigNumber.from((60 * 60 * 24 * 30) / 3);

    const FlexibleNonceForwarderContractFactory = await ethers.getContractFactory("FlexibleNonceForwarder", signer!);
    const flexibleNonceForwarderContract = await FlexibleNonceForwarderContractFactory.deploy(forwardedSignatureExpirationInBlocks);

    await flexibleNonceForwarderContract.deployed();
    const deployedAddress = flexibleNonceForwarderContract.address;

    console.log(`Gateway Token FlexibleForwarder deployed at ${deployedAddress}`);

    await sleep(6000);

    await verify(deployedAddress,[forwardedSignatureExpirationInBlocks]);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});