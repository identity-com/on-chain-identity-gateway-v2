import { addContractToAdmin, getDeploymentSigner, sleep, verify } from "./defender-utils";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { ethers } from 'hardhat';


async function main() {
    const args = ['Dummy USDC', 'USDC', 1000000, process.env.BSC_TESTNET_RELAYER!]
   

    const signer: Signer = await getDeploymentSigner();

    const DummyERC20ContractFactory = await ethers.getContractFactory("DummyERC20", signer!);
    const dummyERC20Contract = await DummyERC20ContractFactory.deploy(...args);

    await dummyERC20Contract.deployed();
    const deployedAddress = dummyERC20Contract.address;

    console.log(`DummyERC20 deployed at ${deployedAddress}`);

    await sleep(6000);

    await verify(deployedAddress,args);

    // Need to wait to avoid rate limit
    await sleep(2000);
    await addContractToAdmin(deployedAddress, "DummyERC20");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

