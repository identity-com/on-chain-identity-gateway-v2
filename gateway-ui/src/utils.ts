import { utils } from "ethers";

export const BNB_TESTNET_CONTRACT_ADDRESSES = {
    gatewayNetwork: "0xcbB5C0536BC80c6983CFaab2574685b5F3b679cb",
    gatewayToken: "0xc25e8e4fd1a892e6c6883ea8e6f3c3eb3b115f44",
    gatekeeper: "0x47340b5b62a1c9038aa70dc1e7344be5a59da8af",
    didRegistry: "0x88a05b4370bbb90c9f3eea72a65c77131a7bc18d"
}
 
export const testNetworkName = utils.formatBytes32String("Identity.com KYC Verification");

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
