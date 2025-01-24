import { sleep, getDeploymentSigner } from "../defender-utils";
import hre , { ethers, upgrades } from "hardhat";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BNB_MAINNET_CONTRACT_ADDRESSES } from "../utils";
import { ChargeHandler, Gatekeeper, GatewayNetwork, GatewayToken } from "../../typechain-types";

async function main() {    
    let signer: Signer;
    signer = await getDeploymentSigner();

    const gatewayNetworkContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayNetwork;
    const gatekeeperContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatekeeper;
    const chargeHandlerContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.chargeHandler;
    const gatewayTokenContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayToken;
    const trustedForwarderContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.trustedForwarder;

    /**
     * Charge Handler
     *  1 - Set network contract address
     *  2 - Give token contract CHARGE_CALLER_ROLE role
     */
    const ChargeHandlerFactory = await ethers.getContractFactory("ChargeHandler", signer!);
    const chargeHanlder = ChargeHandlerFactory.attach(chargeHandlerContractAddress) as ChargeHandler;

    const chargeHandlerRole = await chargeHanlder.CHARGE_CALLER_ROLE();

    await chargeHanlder.connect(signer!).setRole(chargeHandlerRole, gatewayTokenContractAddress);
    await chargeHanlder.connect(signer!).setNetworkContractAddress(gatewayNetworkContractAddress);
    // Need to wait to avoid rate limit
    await sleep(2000);

    /**
     * Gateway Network
     *  1 - Set charge handler with NETWORK_FEE_PAYER_ROLE
     */
    const NetworkContractFactory = await ethers.getContractFactory("GatewayNetwork", signer!);
    const networkContract = NetworkContractFactory.attach(gatewayNetworkContractAddress) as GatewayNetwork;

    const feePayerRole = await networkContract.NETWORK_FEE_PAYER_ROLE();
    await networkContract.connect(signer!).grantRole(feePayerRole, 0, chargeHandlerContractAddress);

    // Need to wait to avoid rate limit
    await sleep(2000);

    /**
     * Gatekeeper
     * 1 - set network contract address
     */

    const GatekeeperContractFactory = await ethers.getContractFactory("Gatekeeper", signer!);
    const gatekeeperContract = GatekeeperContractFactory.attach(gatekeeperContractAddress) as Gatekeeper;

    await gatekeeperContract.setNetworkContractAddress(gatewayNetworkContractAddress);

    // Need to wait to avoid rate limit
    await sleep(2000);

    /**
     * GatewayToken
     * 1 - Add trusted forwarder
     */

    const GatewayTokenContractFactory = await ethers.getContractFactory("GatewayToken", signer!);
    const gatewayTokenContract = GatewayTokenContractFactory.attach(gatewayTokenContractAddress) as GatewayToken;

    await gatewayTokenContract.connect(signer!).addForwarder(trustedForwarderContractAddress);
    await gatewayTokenContract.connect(signer!).updateChargeHandler(chargeHandlerContractAddress);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

