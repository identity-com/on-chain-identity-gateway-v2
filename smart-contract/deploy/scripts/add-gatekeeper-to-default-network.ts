import { sleep, getDeploymentSigner } from "../defender-utils";
import hre , { ethers, upgrades } from "hardhat";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BNB_MAINNET_CONTRACT_ADDRESSES, testNetworkName } from "../utils";
import { GatewayNetwork, GatewayToken, IGatewayNetwork } from "../../typechain-types";

async function main() {    
    let signer: Signer;
    signer = await getDeploymentSigner();

    const gatewayNetworkContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayNetwork;

    const NetworkContractFactory = await ethers.getContractFactory("GatewayNetwork", signer!);
    const networkContract = NetworkContractFactory.attach(gatewayNetworkContractAddress) as GatewayNetwork;

    
    const tx = await networkContract.connect(signer!).addGatekeeper("0xCb0B49dA01F7F7720b35d99De7D5F4ed8Ef5B306", testNetworkName);

    console.log(JSON.stringify(tx))
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

