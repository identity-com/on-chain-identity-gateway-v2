import { sleep, getDeploymentSigner } from "../defender-utils";
import hre , { ethers, upgrades } from "hardhat";
import { Signer } from '@ethersproject/abstract-signer/src.ts'
import { BNB_MAINNET_CONTRACT_ADDRESSES , ZERO_ADDRESS, gatekeeperOneTestnetWallet, gatekeeperTwoTestnetWallet, testNetworkName, testNetworkNameWithErc20Fees, testNetworkNameWithNativeFees } from "../utils";
import { GatewayNetwork, IGatewayNetwork } from "../../typechain-types";
import { utils } from "ethers";

async function main() {    
    let signer: Signer;
    signer = await getDeploymentSigner();

    const gatewayNetworkContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.gatewayNetwork;
    const dummyERC20ContractAddress = BNB_MAINNET_CONTRACT_ADDRESSES.erc20;

    const provider = new ethers.providers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL!);

    const gatekeeprOne = gatekeeperOneTestnetWallet.connect(provider);
    const gatekeeprTwo = gatekeeperTwoTestnetWallet.connect(provider);

    // Network 1: testNetworkNameWithErc20Fees
        // - Create
        // - Add gatekeeper 1 as gatekeeper + primary authority
        // Gatekeeper claim primary authority
    const NetworkContractFactory = await ethers.getContractFactory("GatewayNetwork", signer!);
    const networkContract = NetworkContractFactory.attach(gatewayNetworkContractAddress) as GatewayNetwork;

    const testNetworkOne: IGatewayNetwork.GatekeeperNetworkDataStruct = {
        primaryAuthority: await signer.getAddress(),
        name: testNetworkName,
        passExpireDurationInSeconds: 31536000, // 1 year
        networkFeatureMask: 0,
        networkFee: {
            issueFee: 0,
            refreshFee: 0,
            expireFee: 0,
            freezeFee: 0
        },
        supportedToken: dummyERC20ContractAddress,
        gatekeepers: [],
        lastFeeUpdateTimestamp: 0,
        description: utils.formatBytes32String("Identity-KYC-Verification")
    }

    console.log(`Creating testNetworkOne`);

    await networkContract.connect(signer!).createNetwork(testNetworkOne);



    await sleep(2000);

    // // Network 2: testNetworkNameWithNativeFees
    //     // - Create
    //     // - Add gatekeeper 2 as gatekeeper + primary authority
    //     // Gatekeeper claim primary authority
    
    //     const testNetworkTwo: IGatewayNetwork.GatekeeperNetworkDataStruct = {
    //         primaryAuthority: gatekeeprTwo.address,
    //         name: testNetworkNameWithNativeFees,
    //         passExpireDurationInSeconds: 2628000,
    //         networkFeatureMask: 0,
    //         networkFee: {
    //             issueFee: 100,
    //             refreshFee: 100,
    //             expireFee: 100,
    //             freezeFee: 100
    //         },
    //         supportedToken: ZERO_ADDRESS,
    //         gatekeepers: [],
    //         lastFeeUpdateTimestamp: 0
    //     }
    
    //     console.log(`Creating testNetworkTwo`);
    
    //     await networkContract.connect(signer!).createNetwork(testNetworkTwo, {gasLimit: 500000});
        
            
    //     await sleep(2000);
        
    // // Network 3: identity.com
    //     // - Create
    //     // - Add defender relayer as gatekeeper + primary autority
    //     // Gatekeeper claim primary authority
    //     const defaultIdentityNetwork: IGatewayNetwork.GatekeeperNetworkDataStruct = {
    //         primaryAuthority: await signer!.getAddress(),
    //         name: testNetworkName,
    //         passExpireDurationInSeconds: 2628000,
    //         networkFeatureMask: 0,
    //         networkFee: {
    //             issueFee: 0,
    //             refreshFee: 0,
    //             expireFee: 0,
    //             freezeFee: 0
    //         },
    //         supportedToken: ZERO_ADDRESS,
    //         gatekeepers: [],
    //         lastFeeUpdateTimestamp: 0
    //     }
    
    //     console.log(`Creating defaultIdentityNetwork`);
    
    //    await networkContract.connect(signer!).createNetwork(defaultIdentityNetwork, {gasLimit: 500000});
            
       await sleep(2000);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

