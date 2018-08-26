# Design patterns used in Mecenas

This document have a list of design patterns in Mecenas, and a brief description of how have been implemented and which functions follows these design patterns.

## Restricting Access
The main contract, Mecenas.sol, imports the tested Ownable library from OpenZeppelin, that allows restrict access to core methods like `setBadgesLedgerContract`, `setPercentFee`, `setFixedFee`, `withdrawFees`, pausable methods and mortal methods, only to the contract owner.

## Fail early and fail loud
Most of the functions have modifiers and checks the needed conditions as early as possible, to throw early if the conditions are not met. Some functions using this pattern:

- `getContentCreatorByNickname`
- `contentCreatorFactory`
- `changeContentCreatorAddress`
- `changeAvatar`
- `changeContentCreatorTiers`
- `monthlyWithdraw`
- `supportContentCreator`

## Pull over Push payments (Withdrawal pattern)
All payments are made using the withdrawal pattern, content creators can only withdraw their wage one time per month with `monthlyWithdraw` function. The contract owner also can withdraw the fees with `withdrawFees`.

## Circuit breaker
There is a circuit breaker implemented in Mecenas.sol, using the Pausable library from OpenZeppelin, that can be triggered by the contract owner, in case there is a malfunction or the contract is being hacked.

If the contract is Paused, the following methods can not be called: 
- `supportContentCreator`
- `contentCreatorFactory`
- `changeContentCreatorAddress`
- `changeAvatar`
- `changeContentCreatorTiers`

## Speed bump
Speed bump pattern is also implemented in `monthlyWithdraw`, if a hack related with that function is detected, there is one entire month to apply an upgrade to the contract, before hackers can withdraw the content creators funds.

## Mortal
Mecenas.sol and BadgesLedger.sol have imported the Destructible.sol contract from OpenZeppeling, allowing the contract owner to kill the contracts and receive all the funds with `destroy` function. This Mortal pattern is useful while testing in the ethereum testnets, like Rinkeby, so contracts can be deleted, freeing up some resources and cleaning the testnet blockchain from unused contracts.

In Ethereum Mainnet this method should be replaced by another one that allows users withdraw their funds before killing the contract, to prevent contract owner to run an "exit scam".