// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import './hyperverse/IHyperverseModule.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

contract GoodMorning is IHyperverseModule {
	using Counters for Counters.Counter;
	address public immutable contractOwner;
	address private tenantOwner;

	Counters.Counter public gmCounter;

	struct GMs {
		address sender;
		string greeting;
		uint256 timestamp;
	}
	
	GMs [] public gms;

	event newGM(address sender, string greeting, uint256 timestamp);

	modifier isTenantOwner () {
		require(msg.sender == tenantOwner, "You are not the tenant owner");
		_;
	}

	constructor(address _owner) {
		metadata = ModuleMetadata(
			'Module',
			Author(_owner, 'https://externallink.net'),
			'1.0.0',
			3479831479814,
			'https://externallink.net'
		);
		contractOwner = _owner;
	}

	/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TENANT FUNCTIONALITIES  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
	function init(address _tenant) external {
		/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ASSET VALUE TRACKING: TOKEN  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
		tenantOwner = _tenant;
	}

	function sayGm(string memory _gm) public {
		gmCounter.increment();

		GMs memory gm = GMs(msg.sender, _gm, block.timestamp);
		gms.push(gm);
		emit newGM(gm.sender, gm.greeting, gm.timestamp);
	}

	function getAllGMs() public view returns (GMs[] memory) {
		return gms;
	}

	function getTotalGMs() public view returns (uint256) {
		return gmCounter.current();
	}
}
