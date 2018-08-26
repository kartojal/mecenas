import React from "react";
import { DrizzleContext } from 'drizzle-react'
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';


/* Added a time-bomb hack to show a loading screen, due current bug in drizzle that can't be caught
* in the state. When contract is not deployed or there is no connection to Ethereum network there is
* no way to exactly determine whats happening with the current drizzle state toolset.
*
* Added ~5 seconds of delay  until a network error appears in the web. If not, the loading screen
* would be always "Network error --> Initialized app" instead of "Loading --> Initialized App"
*
* If Web3/Drizzle connects to the network before that timeframe, it stops the timer
* and show the web application.
*
* If after 5 seconds of delay the app can't connect, it will show the "Network error" error page.
*
* Delay is gracePeriod + 1000 ms of the interval (currently 4000ms gracePeriod + 1000ms interval)
*/
export default function withDrizzle (Component) {
  return class extends React.Component {
    state = {
      isListening: false,
      gracePeriod: new Date((new Date()).getTime() + 4*1000),
      tick: 0
    }

    tick() {
      this.setState(prevState => ({
        tick: prevState.tick + 1
      }));
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
      return (
      <DrizzleContext.Consumer>
          {drizzleContext => {
            const { drizzle, drizzleState, initialized } = drizzleContext;
            const { gracePeriod, tick } = this.state;
            const storeState = drizzle.store.getState();
            const currentTime = new Date();

            if (!initialized && tick == 0) {
              this.interval = setInterval(() => this.tick(), 1000);
            }
            if (initialized) {
              clearInterval(this.interval);
            }
            if (!initialized && currentTime > gracePeriod) {
              clearInterval(this.interval);
              if (this.props.errorComp) {
                return this.props.errorComp
              }
              return(
                <main style={{width: '100%', maxWidth: 1200, margin: '0 auto', paddingTop: 40}}>
                  <Typography variant="display3">
                    Oops
                  </Typography>
                  <Typography variant="body2" style={{marginTop: 20, fontSize: "1.4em"}}>
                    This browser has no connection to the Ethereum network. Please use the Chrome/FireFox extension MetaMask, or dedicated Ethereum browsers Mist or Parity.
                  </Typography>
                  <Typography variant="body1" style={{marginTop: 60, fontSize: "1.3em"}}>
                    Contact at github.com/kartojal if you need support or feel that there is something wrong. Thanks!
                  </Typography>
                </main>
              )
            }
     
            if (initialized) {
              return (
                <Component {...this.props} drizzle={drizzle} drizzleState={drizzleState} />
              )
            }
            return(
              <main style={{width: '100%', maxWidth: 1200, margin: '0 auto', paddingTop: 120}}>
                <Typography variant="display2" align="center" style={{marginBottom: 50}}>
                  Loading Mecenas dApp
                </Typography>
                <LinearProgress color="secondary" />
                <Typography variant="caption"  align="center" style={{marginTop: 280, fontSize: "1.3em"}}>
                  Contact at github.com/kartojal if you need support or just want to have a talk. Thanks!
                </Typography>
              </main>
            )
          }}
        </DrizzleContext.Consumer>
      )
    }
  }
}
  