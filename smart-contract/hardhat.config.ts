import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config();

import { task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-solhint';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import "@nomicfoundation/hardhat-foundry";

import { checkGT } from './tasks/checkGT';
import { createGatekeeperNetwork } from './tasks/createGatekeeperNetwork';
import { addGatekeeper } from './tasks/addGatekeeper';
import { removeGatekeeper } from './tasks/removeGatekeeper';
import { issueGT } from './tasks/issueGT';
import { fund } from './tasks/fund';
import { printPrivateKey } from './tasks/printPrivateKey';
import { createWallet } from './tasks/createWallet';
import { addForwarder } from './tasks/addForwarder';
import { execute } from './tasks/execute';
import { getBalance } from './tasks/getBalance';

const derivedAccounts = {
  mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
  path: process.env.MNEMONIC_PATH || "m/44'/60'/0'/0/",
  initialIndex: 0,
  count: 20,
};
const liveAccounts =
  process.env.LOCAL_DEPLOY_PRIVATE_KEY || process.env.LOCAL_DEPLOY_PRIVATE_KEY
    ? [
        `0x${process.env.LOCAL_DEPLOY_PRIVATE_KEY || process.env.LOCAL_DEPLOY_PRIVATE_KEY}`,
        `0x${process.env.LOCAL_DEPLOY_PRIVATE_KEY || process.env.LOCAL_DEPLOY_PRIVATE_KEY}`,
      ]
    : [];

// Set the default contracts path to "contracts"
const defaultPath = './contracts';
const testContractsPath = './test/contracts';

// Override the default "compile" task to compile both main and test contracts
task('compile', 'Compiles the entire project, including main and test contracts')
  .addFlag('noTestContracts', "Don't compile test contracts")
  .setAction(async (args, hre, runSuper) => {
    // First, compile main contracts
    hre.config.paths.sources = defaultPath;
    await runSuper(args);

    // Then, compile test contracts (unless --noTestContracts flag is provided)
    if (!args.noTestContracts) {
      hre.config.paths.sources = testContractsPath;
      await runSuper(args);
    }
  });

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      accounts:
        process.env.NODE_ENV === 'test'
          ? derivedAccounts
          : liveAccounts.map((a) => ({ privateKey: a, balance: '10000000000000000000000' })),
    },
    localhost: {
      allowUnlimitedContractSize: false,
      accounts: liveAccounts,
    },
    bnbTestnet: {
      url: `${process.env.BNB_TESTNET_RPC_URL}`,
      accounts: liveAccounts,
      chainId: 97,
    },
    complereTestnet: {
      url: `${process.env.BNB_TESTNET_RPC_URL}`,
      accounts: liveAccounts,
      chainId: 5918836757,
    },
    bnbMainnet: {
      url: `${process.env.BNB_TESTNET_RPC_URL}`,
      accounts: liveAccounts,
      chainId: 56,
    },
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  contractSizer: {
    runOnCompile: true,
    strict: true,
    except: ['GatewayTokenInternalsTest', 'GatewayTokenUpgradeTest'],
  },
  paths: {
    sources: defaultPath,
    tests: './test',
    cache: './cache',
    artifacts: './build',
    deploy: './deploy',
    deployments: './deployments',
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 15,
  },
  mocha: {
    timeout: 100000,
    // reporter: 'eth-gas-reporter',
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonZkEVM: process.env.POLYGONSCAN_API_KEY,
      polygonZkEVMTestnet: process.env.POLYGONSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      bscTestnet: process.env.BSC_SCAN_API_KEY,
      bsc: process.env.BSC_SCAN_API_KEY
    },
    customChains: [
      {
        network: 'polygonZkEVM',
        urls: {
          apiURL: 'https://api-zkevm.polygonscan.com/api',
          browserURL: 'https://zkevm.polygonscan.com',
        },
        chainId: 1101,
      },
      {
        network: 'polygonZkEVMTestnet',
        urls: {
          apiURL: 'https://api-testnet-zkevm.polygonscan.com/api',
          browserURL: 'https://testnet-zkevm.polygonscan.com/',
        },
        chainId: 1442,
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    gatekeeper: {
      default: 2,
    },
  },
  typechain: {
    outDir: 'typechain-types',
    // target: 'ethers-v5',
    // alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    // externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    // dontOverrideCompile: false // defaults to false
    tsNocheck: true,
  },
};
