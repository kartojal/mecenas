pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title ERC721 token named SubscriptionBadge (SUB) as reward for supporting content creators.
 * 
 * This contract uses the ERC721Token contract from OpenZeppelin, you can check it here: 
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721Token.sol
 * 
 * This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract BadgesLedger is ERC721Token, Ownable {

  address public owner;
  address public minter;
  string public tokenName = "SubscriptionBadge";
  string public tokenSymbol = "SUB";

    constructor () public
        ERC721Token(tokenName, tokenSymbol)
    {
    }

    modifier onlyMinter() {
        require(minter == msg.sender);
        _;
    }

    function setMinterAddress(address minterAddress) public onlyOwner {
      minter = minterAddress;
    }
    /**
    * Custom accessor to create a unique token
    */
    function mintSubscriptionBadge(
        address to,
        uint256 tokenId,
        string  tokenURI
    ) public onlyMinter
    {
        ERC721Token._mint(to, tokenId);
        ERC721Token._setTokenURI(tokenId, tokenURI);
    }
}