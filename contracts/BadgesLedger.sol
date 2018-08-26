pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';
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
contract BadgesLedger is ERC721Token, Ownable, Destructible {

  address public owner;
  address public minter;
  string public tokenName = "SubscriptionBadge";
  string public tokenSymbol = "SUB";

    constructor () public
        ERC721Token(tokenName, tokenSymbol)
    {
    }

    /** @dev Modifier that checks if current msg.sender is minter, throw if not.
      */
    modifier onlyMinter() {
        require(minter == msg.sender);
        _;
    }

    /** @dev Sets the Minter address. Can be a contract or a normal account. Only callable by owner.
      * @param minterAddress The minter address to be set.
      */
    function setMinterAddress(address minterAddress) public onlyOwner {
      minter = minterAddress;
    }
    /**
    * @dev Mint an unique token Badge
    * @param to Address where the token will be allocated after minted.
    * @param tokenId Unique token identifier
    * @param tokenURI Token metadata
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
import 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';