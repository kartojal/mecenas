# Avoding common attacks in Mecenas

This documents have an explanation of how is prevented in Mecenas some of the most common attacks in Solidity contracts.

## Reentrancy attacks or DoS due external payable fallback function
Due using the Pull over Push payments pattern and a month time lock (speed bump) in the `monthlyWithdraw` function, is not possible to do a reentrancy attack using an external contract and the default payable function.

## Transaction ordering
Only content creators can withdraw their own balance, and the other methods does not give any advantage to miners to do transaction ordering and being first calling the contract method.

## Timestamp dependence
Block timestamps can be manipulated by some seconds, but in Ethereum blockchain, a `miner A` should have a time consistent with the network, so other miners can build upon the block that `miner A` mines. The manipulation must be really big (one month) to affect this contract, and not seems very benefficial to the miner.

Some links about this matter:
- [How would a miner cope with a huge block time?](https://ethereum.stackexchange.com/questions/5927/how-would-a-miner-cope-with-a-huge-block-time/5932#5932)
- [How do Ethereum mining nodes maintain a time consistent with the network?](https://ethereum.stackexchange.com/questions/5924/how-do-ethereum-mining-nodes-maintain-a-time-consistent-with-the-network/5931#5931)

## Integer Overflow or Underflow
To be able to defend from this attack vector, Mecenas imports SafeMath.sol contract from OpenZeppelin for the needed maths.

## Force sending Ether
Currenlty there is no benefits from an attacker to force sending Ether to the contract. The amount of Ether sent to this contract will be "lost". The only way to retrieve extra funds is from calling `destroy` function from the `Mortal` imported contract.



