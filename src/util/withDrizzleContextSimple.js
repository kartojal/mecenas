import React from "react";
import { DrizzleContext } from 'drizzle-react'

export default function withDrizzle (Component) {
  return class extends React.Component {
    render() {
      return (
      <DrizzleContext.Consumer>
          {drizzleContext => {
            const { drizzle, drizzleState, initialized } = drizzleContext;
            if (drizzle.web3.status === 'failed') {
              if (this.props.errorComp) {
                return this.props.errorComp
              }
              return(
                <div>
                  <p>Not connected to an Ethereum network.</p>
                </div>
              )
            }
            if (initialized && Object.keys(drizzleState.accounts).length == 0) {
              return(
                <div>
                  <p>Can't find any accounts. Unlock your account at Metamask!</p>
                </div>
              )
            }
            if (initialized) {
              return (
                <Component {...this.props} drizzle={drizzle} drizzleState={drizzleState} />
              )
            }
            return(
              <div>
                <p>Waiting Ethereum connection...</p>
              </div>
            )
          }}
        </DrizzleContext.Consumer>
      )
    }
  }
}
  