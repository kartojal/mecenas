# Mecenas, a final project for Consensys Academy 2018
## About Mecenas

Mecenas is a decentralized, [Patreon-like,](https://patreon.com) mobile friendly application where content creators (artist, youtubers, streamers, podcasters, editors...) can receive Ether monthly, thanks to their backers, named mecenas.

In this way content creators can boost their productivity or creating better content with the help of their followers, without censorship.

**Try it now in Rinkeby testnet, with Chrome + Metamask or Toshi (now Coinbase Wallet) at https://kartojal.github.io/mecenas/**. If using Toshi, remember to change network to Rinkeby, at Settings > Advanced > Active network.

Content creators can give special perks to his backers, like ocult content, mentioning in their videos, or sponsoring.

Currently there is three tiers, Silver, Gold and Platinum tiers, and each one gives a different, non-fungible and unique [ERC721](https://github.com/ethereum/EIPs/issues/721) token as a badge for the Mecenas, each time they support content creators.

The contract owner will receive a small fee (currently half of Patreon fee) for each Mecenas contributor, to maintain the development and operation costs (No ICO, yeah!).

## Different sections of the application

### Landing page:
  - Route path: `/`
  - Metamask: Optional

  #### Description:
  Landing page of the application. Slogan at the top with a call to action to create your own content creator page. At the bottom there is a list of the latest three content creators that can be loaded if the users unlocks Metamask.

### Content Creator profile:
  - Route path: `/:contentCreatorNickname` or `/:contentCreatorAddress`
  - Metamask: required
#### Description
The content creator profile. Here you can see all the Content Creator state data that is stored in the Ethereum blockchain.

  - Top of page: If user uploaded his avatar to IPFS, it will be loaded at the top from the IPFS gateway. If the current Metamask account is the same as the content creator account, you will be able to see the next payday date and the withdraw wage button. Their followers/mecenas can go to the subscription form page if they click in "Be mecenas" button.
  - Left of page: Latest support messages from their mecenas, the remaining balance and buttons to share the profile via social media
  - Middle: Content creator description.
  - Left of the page: At the left there is the different tiers. You can click in each one and you will be redirected to the subscription form page, preselecting the desired tier.

### Content Creator Registry form:
  - Route path: `/registry`
  - Metamask: required

#### Description
A form to register into the contract as a content creator. Here you can write your Nickname and your Description. Optionally you can upload an image from your computer as avatar, that will be stored into IPFS thanks to the public [Infura IPFS nodes](https://infura.io). Once you have filled the form, click the register buttom and the Metamask window should pop-up for a confirmation. Once the transaction is mined and it succeed, you will be redirected to the Content Creator profile page.

Now you can share your url to your followers, so they can support you via prepaid subscription!

### Subscription form:
  - Route path: `/be-mecenas/:contentCreatorNickname` or `/be-mecenas/:contentCreatorAddress`
  - Metamask: required

#### Description
The form where the mecenas can support the content creator. There is four steps here: Select the tier level, Set the duration of the subscription, Write the support message and Subscribe.

- Select the tier level: The user can select three tiers, Silver, Gold or Platinum. Each one have a different price and an unique ERC721 token as a Mecenas Badge. Or just select a custom price.
- Select the duration of the subscription: Here the user can set how many months he want to support the content creator. The page will show the total amount that the user needs to prepay for subscribe to the content creator.
- Write the support message: Here you can write your name and your message, that will be showed in the content creator profile.
- Subscribe: Here you will see a resume of the selected tier and timeframe. Now you can click on the payment button to pay the full subscription.

Once the user is subscribed, the content creator will be able to withdraw the amount in the next payday, one time at a month.


## Used tools

This Consensys final grade project has been possible thanks to the next tools and platforms:

Backend
- Solidity and the Ethereum VM (EVM)
- [OpenZepellin battle-tested framework](https://github.com/OpenZeppelin/openzeppelin-solidity)
- [Nick Johnson](https://github.com/Arachnid) string.sol library
- Array256Lib.sol library from [Modular Inc](https://modular.network)
- IPFS and Infura public IPFS nodes
- Truffle

Frontend
  - React 16
  - Web3.js 1.0 beta
  - Drizzle
  - Material UI
  - Babel
  - Webpack

Testing
  - Truffle testing framework
  - Chai
  - Bluebird promises
  - Ganache CLI

## How to get started

For local testing, you should be using any GNU/Linux like OS, like Ubuntu, console terminal to run commands, and have installed the minimum dependencies: 
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node 8](https://gist.github.com/d2s/372b5943bce17b964a79)
- [Truffle](https://truffleframework.com/docs/truffle/getting-started/installation)
- [Ganache CLI](https://github.com/trufflesuite/ganache-cli#Installation)
- [Chrome](https://www.google.com/chrome/) or [Firefox](https://www.mozilla.org/es-ES/firefox/new/) browser
- [Metamask](https://metamask.io/)  ([Chrome extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=es), or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/))
- [curl](https://www.cyberciti.biz/faq/how-to-install-curl-command-on-a-ubuntu-linux/), if you want to make RPC calls to ganache-cli via the command line, is optional.

If you miss any tool, you can click on the tool name in the previous list and will point you to an installation guide for Ubuntu.

Now lets get started. First open your command line and start Ganache CLI, without arguments, for fast mining and testing:
```
ganache-cli
```

Import the ganache-cli seed phrase into Metamask, to use the default generated addresses in ganache at the browser with Metamask. You can follow instructions of how to import the mnemonic seed phrase in the next link:

- [Setting up Metamask, Ganache docs](https://truffleframework.com/docs/truffle/getting-started/truffle-with-metamask)

After opening ganache-cli and imported the seed into Metamask, you will run the next commands in a new command line window (or a new tab). Open it now and clone this Github repository into your machine with Git clone:

```
git clone https://github.com/kartojal/mecenas.git
```

Change directory (cd) to the recently cloned project:

```
cd mecenas
```

Install the project dependencies:
```
npm install
```

Compile the contracts, deploy and migrate using Truffle. The project is already pointing to ganache cli default port:

```
truffle compile
truffle migrate
```

Now the app is completely installed in your machine and deployed. Now you can test it or start in development mode and interact with it.

Run truffle tests:

```
truffle test
```

Run the development server:

```
npm start
```

After starting the application, you can point your browser to http://localhost:3000 and start interacting with it. Remember to keep open Ganache CLI and login in Metamask extension to be able to see the application in action.

## Production build

If you want to build the production front-end build, run:
```
npm run build
```
Then you can deploy the `build_webpack` dir with the static files into a common web server or github static pages, a patch is applied for supporting BrowserHistory at Github pages. You can read more about it here `https://github.com/rafrex/spa-github-pages` and here `https://github.com/rockchalkwushock/CRA-gh-pages-deployment`.
## Testing `monthlyWithdrawal` with timestamp lock function without `truffle test` in localhost
### Explanation
There is one function named `monthlyWithdraw` that allows a content creator withdraw their wage, one time per month if they have subscribed mecenas. This function is tested in the truffle test files but if you want to mannualy test this function in the frontend, without using the test framework, you can do it making some RPC calls to Ganache-CLI. Using the method `evm_increaseTime` you can jump forward in time, taking the first parameter as the amount of time  to increase in seconds, in integer type (not Hex!).

Once the time is increased, you need to mine one block, with the RPC method `evm_mine`, without any arguments, to apply the new timestamp.

You can also check the prior block timestamp and the next block timestamp with [eth_getBlockByNumber](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getblockbynumber), first argument is block number in Hex, and second argument set to `true` to see all the block details.

### How-to travel in time and withdraw the wage!
Let open ganache-cli in one command line terminal window, start the development server with the frontend.


Subscribe to any content creator via the frontend, clicking at the "Be mecenas" button. By default there is one content creator named `kartojal`.

Open default content creator profile at `http://localhost/kartojal` click on the orange `Be Mecenas` button near the Nickname, and follow the subscription form. Once subbed and the transaction status is "Success", make the next RPC calls.

Increase time to 31 days, or 2678400 seconds:

```
curl -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{ "jsonrpc": "1.0", "id": "100", "method": "evm_increaseTime", "params": [ 2678400 ] }'
```

Mine next block to adjust time:
```
curl -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{ "jsonrpc": "1.0", "id": "101", "method": "evm_mine", "params": [] }'
```

Now you can browse the content creator page to withdraw the funds. Remember to select the content creator account address at Metamask to be able to see and  withdraw the monthly wage via the "Withdraw wage" button. By default `kartojal` content creator is the first account address, same as contract owner address and you can access it again at `http://localhost/kartojal`.

At the top of the button says when you will be able to unlock the funds, so be sure that Ganache CLI block date is greater than that date. 

If you want to know the current block timestamp, lets paste the next `curl` commands:
```
curl -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{ "jsonrpc": "1.0", "id": "101", "method": "eth_blockNumber", "params": [] }'
```
Response:
```
## {"id":"103","jsonrpc":"1.0","result":"0x17"}

```
The "result" field will contain the current block number, in hexadecimal format. You need to copy and paste the "result" value into the first argument of the next RPC method, named `getBlockByNumber`. In my case, the current block number is "0x17".

```
curl -X POST htc": "1.0", "id": "104", "method": "eth_getBlockByNumber", "params": ["0x17", "true"] }'
```
Response:
```
{  
   "id":"101",
   "jsonrpc":"1.0",
   "result":{  
      "number":"0x17",
      "hash":"0xb908fed61904b65ebc98e2ffc5f4fa293cd70d9a06c1162feeeb80b34bfcf5fc",
      "parentHash":"0xd872c15b85110ebde3abcbf0ea344fec532cf09cd1f88d04c6d3a8150a44eec2",
      "mixHash":"0x0000000000000000000000000000000000000000000000000000000000000000",
      "nonce":"0x0000000000000000",
      "sha3Uncles":"0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "transactionsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      "stateRoot":"0xc736d0c5876842853ad739630a6d5c1aec3bf936a4912a8cf0a6c5e0fac3a220",
      "receiptsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      "miner":"0x0000000000000000000000000000000000000000",
      "difficulty":"0x0",
      "totalDifficulty":"0x0",
      "extraData":"0x",
      "size":"0x03e8",
      "gasLimit":"0x6691b7",
      "gasUsed":"0x0",
      "timestamp":"0x5bfbf3aa",
      "transactions":[  

      ],
      "uncles":[  

      ]
   }
```

There is a lot of metadata in a block. But the only field that we need to know the current time in the blockchain is the `timestamp` field. In this case, the value of the `timestamp`  field is "0x5bfbf3aa", converted to Unix Epoch is 1543238570, and to readable date `Monday, 26 November 2018 13:22:50` in GMT.

You can use this very useful online tool that converts the hex `timestamp` value into a readable timestamp:
- [EpochConverter - Unix Hex Timestamp Converter](https://www.epochconverter.com/hex)
