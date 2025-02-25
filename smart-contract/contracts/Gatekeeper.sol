// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import { IGatewayGatekeeper } from './interfaces/IGatewayGatekeeper.sol';
import { IGatewayNetwork } from "./interfaces/IGatewayNetwork.sol";
import { ParameterizedAccessControl } from "./ParameterizedAccessControl.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Common__MissingAccount} from "./library/CommonErrors.sol";

contract Gatekeeper is ParameterizedAccessControl, IGatewayGatekeeper, UUPSUpgradeable {
    address public _gatewayNetworkContract;


    modifier onlyNetworkContract() {
        require(msg.sender == _gatewayNetworkContract, "Only the gateway network contract can interact with this function");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    // empty constructor in line with the UUPS upgradeable proxy pattern
    // solhint-disable-next-line no-empty-blocks
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) initializer public {
      // Contract deployer is the initial super admin
      if (owner == address(0)) revert Common__MissingAccount();
      _superAdmins[owner] = true;
    }

    function setNetworkContractAddress(address gatewayNetworkContract) external onlySuperAdmin override {
        if (gatewayNetworkContract == address(0)) revert Common__MissingAccount();
        _gatewayNetworkContract = gatewayNetworkContract;
    }


    function getGatekeeperNetworkData(bytes32 networkName, address gatekeeper) external view override returns(GatekeeperNetworkData memory) {
        if(!_gatekeeperStates[gatekeeper][networkName].initialized) {
            revert GatekeeperNotInNetwork(uint256(networkName), gatekeeper);
        }
        return _gatekeeperStates[gatekeeper][networkName];
    }

    function initializeGatekeeperNetworkData(bytes32 networkName, address gatekeeper, GatekeeperStatus initialStatus) external onlyNetworkContract override {
        _gatekeeperStates[gatekeeper][networkName].initialized = true;
        _gatekeeperStates[gatekeeper][networkName].lastFeeUpdateTimestamp = 0;
        updateGatekeeperStatus(networkName, gatekeeper, initialStatus);
    }


    function updateGatekeeperStatus(bytes32 networkName, address gatekeeper, GatekeeperStatus status) public onlyNetworkContract override {
        GatekeeperStatus oldStatus = _gatekeeperStates[gatekeeper][networkName].status;
        _gatekeeperStates[gatekeeper][networkName].status = status;
        emit GatekeeperStatusChanged(oldStatus, status);
    }

    function updateFees(GatekeeperFees calldata fees, bytes32 networkName) external override {
        address gatekeeper = msg.sender;

        if(!_gatekeeperStates[gatekeeper][networkName].initialized) {
            revert GatekeeperNotInNetwork(uint256(networkName), gatekeeper);
        }

        uint lastUpdatedTimestamp = _gatekeeperStates[gatekeeper][networkName].lastFeeUpdateTimestamp;

        if(lastUpdatedTimestamp != 0 && block.timestamp < lastUpdatedTimestamp + FEE_CONFIG_DELAY_TIME) {
            revert GatekeeperFeeCannotBeUpdatedYet(lastUpdatedTimestamp, lastUpdatedTimestamp + FEE_CONFIG_DELAY_TIME);
        }

        _gatekeeperStates[gatekeeper][networkName].fees = fees;
        _gatekeeperStates[gatekeeper][networkName].lastFeeUpdateTimestamp = block.timestamp;
    }

    function removeGatekeeper(bytes32 networkName, address gatekeeper) external onlyNetworkContract override {
        delete _gatekeeperStates[gatekeeper][networkName];
    }

    function _authorizeUpgrade(address) internal override onlySuperAdmin {}
}