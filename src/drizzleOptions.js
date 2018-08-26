import Mecenas from './../build/contracts/Mecenas.json'
import BadgdesLedger from './../build/contracts/BadgesLedger.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    Mecenas,
    BadgdesLedger
  ],
  polls: {
    accounts: 1500
  },
  events: {
    Mecenas: [{
      eventName: 'newSubscriptionMessage',
      eventOptions: {
        from: 0
      }
    }]
  }
}

export default drizzleOptions