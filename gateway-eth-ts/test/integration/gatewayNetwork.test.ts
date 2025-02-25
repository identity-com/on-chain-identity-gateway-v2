import * as dotenv from "dotenv";
import * as assert from "assert";
import { GatewayNetworkClass } from "../../src/service/GatewayNetwork";
import { Wallet, ethers, utils } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { BNB_TESTNET_CONTRACT_ADDRESSES, ZERO_ADDRESS, gatekeeperOneTestnetWallet, gatekeeperTwoTestnetWallet, initTestNetwork, testNetworkName, testNetworkNameWithErc20Fees } from "../utils";
import { GatewayNetwork, GatewayNetwork__factory } from "../../src/contracts/typechain-types";
import { defaultAbiCoder } from "@ethersproject/abi";


dotenv.config();

describe("Gateway Network TS class", function () {
    let gatewayNetworkClient: GatewayNetworkClass;
    let gatewayNetworkContract: GatewayNetwork;
    

    let provider: BaseProvider;
    let gatekeeper: Wallet;
    let randomWallet: Wallet;

    before("Initialize gateway gatekeeper ts class", async function () {
        this.timeout(20000);
        provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

        gatekeeper = gatekeeperOneTestnetWallet.connect(provider);

        randomWallet = gatekeeperTwoTestnetWallet.connect(provider);
        
        gatewayNetworkClient = new GatewayNetworkClass(gatekeeper, BNB_TESTNET_CONTRACT_ADDRESSES.gatewayNetwork);
        gatewayNetworkContract = GatewayNetwork__factory.connect(BNB_TESTNET_CONTRACT_ADDRESSES.gatewayNetwork, gatekeeper);

    });

    describe("Public functions", async function () {
        it("isGatekeeper should return true for a valid gatekeeper", async function() {
            assert.equal(await gatewayNetworkClient.isGatekeeper(testNetworkName, gatekeeper.address), true);
        }).timeout(5000);

        it("getGatekeepersOnNetwork should return correct list of gatekeepers on default network", async function() {
            const result = await gatewayNetworkClient.getGatekeepersOnNetwork(testNetworkName);

            assert.equal(result.length >= 2, true);
            assert.equal(result[1], gatekeeper.address);
        }).timeout(5000);

        it("getNetworkId should return correct id for valid network", async function() {
            assert.notEqual(await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkName)), 0);
        });

        it("doesNetworkExist should return true for valid network", async function() {
            const networkId = await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkName));
            assert.equal(await gatewayNetworkClient.doesNetworkExist(networkId.toString()), true);
        });

        it("getSupportedFeeTokenAddress should zero_address as token of the default test network", async function() {
            assert.equal(await gatewayNetworkClient.getSupportedFeeTokenAddress(testNetworkName), ZERO_ADDRESS);
        });
    });

    describe("Network Primary Authority", async function () {
        it("should add gatekeeper to the default test network of the test network", async function () {
            this.timeout(10000);
            await gatewayNetworkClient.addGatekeeper(testNetworkNameWithErc20Fees, randomWallet.address);
            assert.equal(await gatewayNetworkClient.isGatekeeper(testNetworkNameWithErc20Fees, randomWallet.address), true); 
        }).timeout(15000);

        it("should remove gatekeeper from the default test network of test network", async function () {
            this.timeout(10000);
            await gatewayNetworkClient.removeGatekeeper(testNetworkNameWithErc20Fees, randomWallet.address);
            assert.equal(await gatewayNetworkClient.isGatekeeper(testNetworkNameWithErc20Fees, randomWallet.address), false);
        }).timeout(15000);

        it("should successfully update the primary authority of test network", async function () {
            this.timeout(20000);
            const resultOne = await gatewayNetworkClient.updatePrimaryAuthority(testNetworkNameWithErc20Fees, randomWallet.address);
            await resultOne.wait();

            const randomWalletClient = new GatewayNetworkClass(randomWallet, BNB_TESTNET_CONTRACT_ADDRESSES.gatewayNetwork);

            const resultTwo = await randomWalletClient.claimPrimaryAuthority(testNetworkNameWithErc20Fees);
            await resultTwo.wait();

            

            // reset primary authority to original gatekeeper

            const resultThree = await randomWalletClient.updatePrimaryAuthority(testNetworkNameWithErc20Fees, gatekeeper.address);
            await resultThree.wait();

            const resultFour = await gatewayNetworkClient.claimPrimaryAuthority(testNetworkNameWithErc20Fees);
            await resultFour.wait();
        });

        it("should successfully update the networks default pass expiration time of test network", async function () {
            const newDefaultTime = 1000;
            await gatewayNetworkClient.updatePassExpirationTimeConfig(testNetworkNameWithErc20Fees, newDefaultTime);

            const networkId = await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkNameWithErc20Fees));
            const network = await gatewayNetworkClient.getNetwork(networkId.toString());

            assert.equal(network.passExpireDurationInSeconds, newDefaultTime);
        }).timeout(15000);

        it("should successfully update the description of test network", async function () {
            const newDescription = 'new description';
            await gatewayNetworkClient.updateDescription(newDescription,testNetworkNameWithErc20Fees);

            const networkId = await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkNameWithErc20Fees));
            const network = await gatewayNetworkClient.getNetwork(networkId.toString());
        }).timeout(15000);

        it("should successfully update the networks fee % of test network", async function () {
            const newDefaultFee = 100;
            const newFees = {issueFee: newDefaultFee, expireFee: newDefaultFee, refreshFee: newDefaultFee, freezeFee: newDefaultFee};
            const result = await gatewayNetworkClient.updateFees(testNetworkNameWithErc20Fees, newFees);
            result.wait();

            const networkId = await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkNameWithErc20Fees));
            const network = await gatewayNetworkClient.getNetwork(networkId.toString());

            assert.equal(network.networkFee.expireFee, newFees.expireFee);
            assert.equal(network.networkFee.issueFee, newFees.issueFee);
            assert.equal(network.networkFee.refreshFee, newFees.refreshFee);
            assert.equal(network.networkFee.freezeFee, newFees.freezeFee);
        });

        it("should successfully update the features of test network", async function () {
            const result = await gatewayNetworkClient.updateNetworkFeatures(testNetworkNameWithErc20Fees, 1);
            result.wait();

            const networkId = await gatewayNetworkClient.getNetworkId(utils.parseBytes32String(testNetworkNameWithErc20Fees));
            const network = await gatewayNetworkClient.getNetwork(networkId.toString());
            assert.equal(network.networkFeatureMask, 1);
        }).timeout(15000);
    });

});