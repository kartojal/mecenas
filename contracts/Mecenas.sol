pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/math/Math.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './libraries/strings.sol';
import './libraries/Array256Lib.sol';
import './BadgesLedger.sol';

// ToDO: Explain design patterns used in this contract: fail early, pull over push payment, restrict access, circuit breaker

contract Mecenas is Ownable, Pausable {
  using SafeMath for uint256;
  using Math for uint256;
  using Array256Lib for uint256[];
  using strings for *;
  
  address public owner;
  uint256 public ownerBalance;

  BadgesLedger public badgesLedger;

  uint public feePercent; 
  uint public fixedFee;

  struct PriceTierSuggestion {
    uint256 price;
    string title;
    string description;
  }

  struct MecenasMessage {
    bytes32 mecenasNick;
    address mecenasAddress;
    address contentCreatorAddress;
    string message;
    uint subscriptions;
    uint priceTier;
  }

  struct MecenasSupport {
    bytes32 nickname;
    address[] supportsContentCreators;
  }

  struct ContentCreator {
    bytes32 nickname;
    string description;
    uint256 creationTimestamp;
    uint256 subscriptionIndex;
    uint256 payday;
    uint256 balance;
    string ipfsAvatar;
    address[] mecenasAddresses;
    mapping (uint => uint256[]) mecenasSubscriptions;
  }

  struct Badge {
    uint256 tokenId;
    address contentCreatorAddress;
  }

  mapping (address => PriceTierSuggestion[3]) public suggestPriceTiers;
  mapping (address => MecenasMessage[]) public messageInbox;
  mapping (address => ContentCreator) public contentCreators;
  mapping (address => MecenasSupport) public mecenas;
  mapping (address => Badge[]) public mecenasBadges;
  mapping (bytes32 => address) public contentCreatorAddresses;
  
  /**
    Emits a new subscription message, from the mecenas to the content creator.
    It can be showed in the main website or integrated into a streaming platform,
    to show in live and see the content creator reaction.

    An integration with Twitch could be possible.
   */
  event newSubscriptionMessage(address contentCreatorAddress, bytes32 mecenasNickname, string mecenasMessage);

  /**
    Emits a new content creator. This can be consumed in the webapp to show latest content creators.
   */
  event newContentCreator(address contentCreatorAddress, bytes32 nickname, string ipfsAvatar);

  /**
    Initialize the contract, sets an owner, a default feePercent and fixedFee.
   */
  constructor() public {
    owner = msg.sender;
    feePercent = 1;
    fixedFee = 0.0006 ether;
  }

  function setBadgesLedgerContract(address badgesLedgerAddress) public onlyOwner {
    badgesLedger = BadgesLedger(badgesLedgerAddress);
  }

  /**
    Modifier to throw when msg.value is less than contract owner fee;
   */
  modifier minimumAmount {
    require(msg.value > getMinimumAmount());
    _;
  }

  /**
    Calculate and returns the minimum amount possible to surpass owner fees.
   */
  function getMinimumAmount() public view returns(uint) {
    return fixedFee.add(fixedFee.mul(feePercent).div(100));
  }
  /**
    Function that returns true if first argument is greater than minimum owner fee.
   */
  function greaterThanMinimumAmount(uint amount) public view returns (bool) {
    return amount > getMinimumAmount();
  }
  /** Owner functions (developer) **/

  /** 
    Set fee per content creator subscription
  */
  function setPercentFee(uint256 newFee) public onlyOwner {
    feePercent = newFee;
  }

  /** 
    Set fee per content creator subscription
  */
  function setFixedFee(uint256 newFee) public onlyOwner {
    feePercent = newFee;
  }
  /**
    Pay the fee to the contract owner. Returns the remain amount to support the content creator.
   */
  function payFee() private returns(uint256) {
    require(msg.value > getMinimumAmount());
    uint256 currentAmount = msg.value;
    uint256 fee = fixedFee.add(currentAmount.mul(feePercent).div(100));
    uint256 amountAfterFee = currentAmount - fee;
    require(amountAfterFee > 0);
    ownerBalance = ownerBalance + fee;
    return amountAfterFee;
  }
  /**
    Content creator functions
   */

  function getTiersLength(address contentCreatorAddress) public view returns (uint) {
    return suggestPriceTiers[contentCreatorAddress].length;
  }

  function getTier(address contentCreatorAddress, uint index) public view returns (
    string title,
    string description,
    uint price
  ) {
    PriceTierSuggestion memory tier = suggestPriceTiers[contentCreatorAddress][index];
    title = tier.title;
    description = tier.description;
    price = tier.price;
  }

  function getContentCreator(address addressInput) public view returns (
      bytes32 nickname,
      string description,
      uint256 creationTimestamp,
      uint256 payday,
      uint256 balance,
      string ipfsAvatar,
      uint256 totalMecenas,
      address contentCreatorAddress,
      uint256 wage
    ) {
    ContentCreator memory contentCreator = contentCreators[addressInput];
    nickname = contentCreator.nickname;
    description = contentCreator.description;
    creationTimestamp = contentCreator.creationTimestamp;
    payday = contentCreator.payday;
    balance = contentCreator.balance;
    ipfsAvatar = contentCreator.ipfsAvatar;
    totalMecenas = contentCreator.mecenasAddresses.length;
    contentCreatorAddress = addressInput;
    wage = calculateNextWage(addressInput);
  }

  function getContentCreatorAddress(bytes32 nickname) public view returns (
      address contentCreatorAddress
    ) {
    contentCreatorAddress = contentCreatorAddresses[nickname];
  }

  function getContentCreatorByNickname(bytes32 nick) public view returns (
      bytes32 nickname,
      string description,
      uint256 creationTimestamp,
      uint256 payday,
      uint256 balance,
      string ipfsAvatar,
      uint256 totalMecenas,
      address contentCreatorAddress,
      uint256 wage
    ) {
    contentCreatorAddress = getContentCreatorAddress(nick);
    require(contentCreatorAddress != address(0));
    ContentCreator memory contentCreator = contentCreators[contentCreatorAddress];
    nickname = contentCreator.nickname;
    description = contentCreator.description;
    creationTimestamp = contentCreator.creationTimestamp;
    payday = contentCreator.payday;
    balance = contentCreator.balance;
    ipfsAvatar = contentCreator.ipfsAvatar;
    totalMecenas = contentCreator.mecenasAddresses.length;
    wage = calculateNextWage(contentCreatorAddress);
  }

  function setDefaultPriceTiers() private {
    // Default tiers
    PriceTierSuggestion memory tierSilver = PriceTierSuggestion({
      title: "Silver",
      description: "You will receive a Silver badge token in compensation, ocassional extra content like making-off videos or photos. And a lot of love.",
      price: getMinimumAmount() + 0.01 ether
    });
    PriceTierSuggestion memory tierGold = PriceTierSuggestion({
      title: "Gold",
      description: "You will receive a Gold badge token in compensation, extra video content and audio commentary of new and old videos. And a lot of love.",
      price: getMinimumAmount() + 0.02 ether
    });
    PriceTierSuggestion memory tierPlatinum = PriceTierSuggestion({
      title: "Platinum",
      description: "You will receive a Gold badge token in compensation, all of above and access to an exclusive forum, where i will reply to any question you want to ask to me. And a lot of love.",
      price: getMinimumAmount() + 0.05 ether
    });
    suggestPriceTiers[msg.sender][0] = tierSilver;
    suggestPriceTiers[msg.sender][1] = tierGold;
    suggestPriceTiers[msg.sender][2] = tierPlatinum;
  }

  function getSubscriberLevel(uint256 amount, PriceTierSuggestion[3] priceTiers) private pure returns (string){
    bool levelFound = false;
    uint priceTierIndex = 0;
    uint currentLevel = 0;
    for(uint counter = 0; counter < 3; counter++){
        if(amount > uint(priceTiers[counter].price)) {
          if (uint(priceTiers[counter].price) > currentLevel) {
            currentLevel = priceTiers[counter].price;
            priceTierIndex = counter;
            if (levelFound == false) {
              levelFound = true;
            }
        }
      }
    }
    if (levelFound == false) {
      return "Subscriber";
    } 
    return priceTiers[priceTierIndex].title;
  }

  function contentCreatorFactory(bytes32 nickname, string description, string ipfsAvatar) public whenNotPaused {
    ContentCreator storage contentCreator = contentCreators[msg.sender];
    // At least nickname must be greater than zero chars, be unique, and content creator must not exists
    require(nickname.length > 0 && contentCreatorAddresses[nickname] == address(0) && contentCreator.payday == 0);
    // Initialize a new content creator
    contentCreatorAddresses[nickname] = msg.sender;
    contentCreator.nickname = nickname;
    contentCreator.description = description;
    contentCreator.creationTimestamp = now;
    contentCreator.payday = now + 30 days;
    contentCreator.balance = 0;
    contentCreator.ipfsAvatar = ipfsAvatar;
    contentCreator.subscriptionIndex = 1;

    setDefaultPriceTiers();
    // Emit content creator event
    emit newContentCreator(msg.sender, nickname, ipfsAvatar);
  }

  /**
    Set a new content creator address, only allowed by content creator itself.
   */
  function changeContentCreatorAddress(address newAddress) public whenNotPaused {
    ContentCreator memory current = contentCreators[msg.sender];
    require(current.payday > 0);
    delete contentCreators[msg.sender];
    delete contentCreatorAddresses[current.nickname];
    contentCreators[newAddress] = current;
    contentCreatorAddresses[current.nickname] = newAddress;
  }

  function changeAvatar(string avatarHash) public whenNotPaused {
    ContentCreator storage current = contentCreators[msg.sender];
    require(current.payday > 0);
    current.ipfsAvatar = avatarHash;
  }

  function changeContentCreatorTiers(uint tierIndex, string title, string description, uint256 price) public whenNotPaused {
    ContentCreator storage current = contentCreators[msg.sender];
    // Check if content creator is initialized, price is greater than minimum amount and string params are not empty.
    require(current.payday > 0 && price > getMinimumAmount() && bytes(title).length > 0 && bytes(description).length > 0);
    // Replace value in global map variable
    suggestPriceTiers[msg.sender][tierIndex] = PriceTierSuggestion({
      title: title,
      description: description,
      price: price
    });
  }

  function changeDescription(string description) public whenNotPaused {
    ContentCreator storage current = contentCreators[msg.sender];
    require(current.payday > 0);
    current.description = description;
  }

  /**
    Calculare next content creator wage.
   */
  function calculateNextWage(address contentCreatorAddress) public view returns (uint256){
    ContentCreator storage contentCreator = contentCreators[contentCreatorAddress];
    return contentCreator.mecenasSubscriptions[contentCreator.subscriptionIndex].sumElements();
  }

  /**
    Allow content creator to withdraw once the payload date is greater or equal than today. If contract
    is paused, this function is still reachable for content creators.
   */
  function monthlyWithdraw() public {
    ContentCreator storage current = contentCreators[msg.sender];
    uint  nextWage = current.mecenasSubscriptions[current.subscriptionIndex].sumElements();
    // Allow withdraw only after payday
    require(now >= current.payday && current.balance > 0);
    // If the current balance is less than the theorical monthly withdraw, withdraw that lower amount.
    uint transferAmount = current.balance.min256(nextWage);
    // Remember to lock the withdraw function until next month
    current.payday = current.payday + 30 days;
    // Point to the next subscription index
    current.subscriptionIndex = current.subscriptionIndex + 1;
    // Remember to substract the pending withdraw before
    // sending to prevent re-entrancy attacks
    current.balance = current.balance - transferAmount;
    msg.sender.transfer(transferAmount);
  }

  /** Mecenas functions **/

  /**
    Emit a Mecenas Message event to be consumed in a stream or website. Show the support from the mecenas to the content creator.
   */

  function broadcastNewSubscription(bytes32 mecenasNickname, address contentCreatorAddress, string message, uint256 subscriptions, uint256 priceTier) private {
    MecenasMessage memory newSubMessage = MecenasMessage({
      mecenasNick: mecenasNickname,
      mecenasAddress: msg.sender,
      contentCreatorAddress: contentCreatorAddress,
      message: message,
      subscriptions: subscriptions,
      priceTier: priceTier
    });
    // Save message into storage
    messageInbox[contentCreatorAddress].push(newSubMessage);
    // Send a new subscription event
    emit newSubscriptionMessage(newSubMessage.contentCreatorAddress, newSubMessage.mecenasNick, newSubMessage.message);
  }

  /**
    Support a determined content creator, via a prepaid monthly subscription.
     You can set any price, regarding the suggested price tiers, and add a support message to the content creator.
   */
  function supportContentCreator(address contentCreatorAddress, uint256 subscriptions, string message, bytes32 mecenasNickname) public payable whenNotPaused{
    require(contentCreatorAddress != address(0) && msg.value > 0);
    // Calculate fee and sum to contract owner balance
    uint256 amountAfterFees = payFee();
    // Calculate price per month subscription (totalAmount / months = priceTier)
    uint256 priceTier = amountAfterFees.div(subscriptions);
    ContentCreator storage contentCreator = contentCreators[contentCreatorAddress];
    require(contentCreator.subscriptionIndex >= 1);
    // Add the subscriptions to the content creator
    for (uint newSub = 0; newSub < subscriptions; newSub++) {
      contentCreator.mecenasSubscriptions[contentCreator.subscriptionIndex + newSub].push(priceTier);
      contentCreator.balance = contentCreator.balance + priceTier;
    }
    // Add the mecenas address to the content creator
    contentCreator.mecenasAddresses.push(msg.sender);
    // Save mecenas into global variable
    mecenas[msg.sender].nickname = mecenasNickname;
    mecenas[msg.sender].supportsContentCreators.push(contentCreatorAddress);

    // Mint SubscriptionBadge to Mecenas
    uint tokenId = badgesLedger.totalSupply() + 1; 
    string memory subscriptionLevel = getSubscriberLevel(priceTier, suggestPriceTiers[contentCreatorAddress]);
    // Token uri contains "level" string 
    string memory tokenUri = subscriptionLevel;
    badgesLedger.mintSubscriptionBadge(msg.sender, tokenId, tokenUri);
    // Save token into separate map, that contains tokenId and contentCreator address, mapped by mecenas address.
    Badge[] storage mecenasTokens = mecenasBadges[msg.sender];
    mecenasTokens.push(Badge({tokenId: tokenId, contentCreatorAddress: contentCreatorAddress}));
    // Send message to the content creator inbox and emit event
    broadcastNewSubscription(mecenasNickname, contentCreatorAddress, message, subscriptions, priceTier);
  }

  function withdrawFees() public onlyOwner {
    // Remember to substract the pending withdraw before
    // sending to prevent re-entrancy attacks
    uint256 transferAmount = ownerBalance;
    ownerBalance -= transferAmount;
    msg.sender.transfer(transferAmount);
  }
}