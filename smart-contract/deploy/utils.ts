import { DefenderRelayProvider, DefenderRelaySigner } from "@openzeppelin/defender-relay-client/lib/ethers";
import { Wallet, ethers, utils } from "ethers";

interface GatewayProtocolContractAddresses {
    flagsStorage: string,
    gatekeeper: string,
    gatewayNetwork: string,
    chargeHandler: string,
    gatewayStaking: string,
    erc20: string,
    gatewayToken: string,
    forwarder: string,
    trustedForwarder: string
}

export const BNB_MAINNET_CONTRACT_ADDRESSES: GatewayProtocolContractAddresses = {
    flagsStorage: "0xa42353DeEda212dD62Fd76357AaBBD377867E3de",
    gatekeeper: "0x3B17Cc23547fa956678792d4Db7d1a460ED1BE6C",
    gatewayNetwork: "0x9A76a53CF4B75174D89a4b88797164677d363e0e",
    chargeHandler: "0x1B40fC7f6731860e48dEd4781E765998fA58e507",
    gatewayStaking: "0x2Ee110078Be3848fC3Da52c373c1B0c7C6486ea8",
    erc20: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC on BNB (https://bscscan.com/address/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d)
    gatewayToken: "0x62160b81c9872283d63de561d7469D440560a7cb",
    forwarder: "0xD3d93548af709b3d717C160B82816f4351290878",
    trustedForwarder: "0xD3d93548af709b3d717C160B82816f4351290878"
}

export const BNB_TESTNET_CONTRACT_ADDRESSES: GatewayProtocolContractAddresses = {
    flagsStorage: "0x06c9d91b3Acc1D2434342242C987064E555FFe8a",
    gatekeeper: "0x47340b5b62a1c9038aa70dc1e7344be5a59da8af",
    gatewayNetwork: "0xcbB5C0536BC80c6983CFaab2574685b5F3b679cb",
    chargeHandler: "0xDc3f03B401826FEAA80bdCA3c3CB2d5816a5Bc77",
    gatewayStaking: "0xf1311706736cf9e75992252e2ab2824f530f847b",
    erc20: "0xf380c37eFf6c5ab0593927dFf4Bc7AF6428D541F",
    gatewayToken: "0xc25e8e4fd1a892e6c6883ea8e6f3c3eb3b115f44",
    forwarder: "0x96b905fF1eDfAdAEc03879450f3DC35a8124dc05",
    trustedForwarder: "0x96b905ff1edfadaec03879450f3dc35a8124dc05"
}

export const COMPLERE_TESTNET_CONTRACT_ADDRESSES: GatewayProtocolContractAddresses = {
    flagsStorage: "0x35df92b2dFc8C606a1D2FAfE26e6B66182Ef5822",
    gatekeeper: "0x222Ba251eD01B60144ca220bEB9Ed17ED98e3AAe",
    gatewayNetwork: "0xf4F929E10dD465aF803EC0fa70dA5898129392F3",
    chargeHandler: "0x412338eABdB8c88F1d83E91DBc2d289fC18b4Deb",
    gatewayStaking: "0x6B231070318e4a0B2047402336Df78C0b2721102",
    erc20: "0xE331C1096e9317bF76E5B8815E6ac7487099c763",
    gatewayToken: "0x8252B797EA14F0006818FaefA6b3dCFefa39eaEd",
    forwarder: "0x567b21dCFacf0Ba2bfCF6B059833a083b7cDf6d1",
    trustedForwarder: "0x567b21dCFacf0Ba2bfCF6B059833a083b7cDf6d1"
}

/**
 * Testnet wallets (foundry defaults)
 */

export const DEFAULT_MNEMONIC =
  "test test test test test test test test test test test junk";

// All addresses are default foundry addresses
export const deployerWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
export const gatekeeperOneTestnetWallet = new Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"); // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
export const gatekeeperTwoTestnetWallet = new Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"); // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
export const userOneWallet = new Wallet("0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"); // 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const testNetworkName = utils.formatBytes32String("Identity-KYC-Verification");


export const testNetworkNameWithErc20Fees = "0x6e7574776f726b5f476974685f65726332305f66656573000000000000000000";
export const testNetworkNameWithNativeFees = "0x6e6574776f726b5f776974685f6e61746976655f666565730000000000000000";

export async function loadRelayerSigner(provider?: ethers.providers.Provider) {
    const credentials = {apiKey: process.env.DEFENDER_RELAY_API_KEY!, apiSecret: process.env.DEFENDER_RELAY_SECRET!};
    provider = provider ? provider : new DefenderRelayProvider(credentials);
    return new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
}