import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import withDrizzleContext from "../../util/withDrizzleContext";
import Divider from '@material-ui/core/Divider';
import _ from "lodash";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { isFound } from '../../mecenas-store/ContentCreator';
import MetamaskLogoPath from '../../metamask_logo.svg';

import Tiers from './Tiers';
import Top from './Top';
import Description from './Description';
import LeftSidebar from './LeftSidebar';
import MessageInbox from './MessageInbox';
import Error404 from './../404';

const styles = theme => ({
  gridContainer: {
    [theme.breakpoints.up('lg')]: {
      margin: "0 220px",
    },
    [theme.breakpoints.up('md')]: {
      margin: "0 120px",
    },
    [theme.breakpoints.down('md')]: {
      margin: "0 15px",
    },
  },
  meta: {
    width: '300px'
  }
});

class ContentCreator extends PureComponent {
  state = {
    isAddress: false,
    pointer: "",
    address: ''
  }

  async componentDidMount() {
    const {drizzle, drizzleState} = this.props;
    const routerId = this.props.match.params.contentCreator;
    if (drizzle.web3.utils.isAddress(routerId)) {
      const contentCreatorPointer = drizzle.contracts.Mecenas.methods.getContentCreator.cacheCall(routerId)
      this.setState({
        pointer: contentCreatorPointer,
        address: routerId,
        isAddress: true
      });
      return;
    }
    const rawNickname = drizzle.web3.utils.utf8ToHex(routerId);
    const contentCreatorPointer = drizzle.contracts.Mecenas.methods.getContentCreatorByNickname.cacheCall(rawNickname)
    const address = await drizzle.contracts.Mecenas.methods.getContentCreatorAddress(rawNickname).call()
    console.log("add", address)
    this.setState({
      pointer: contentCreatorPointer,
      address: address,
      isAddress: false
    });
  }

  render() {
    const {classes, history, drizzleState } = this.props;
    const { pointer, isAddress, address } = this.state;

    const contentCreatorExists = isFound(drizzleState, pointer, isAddress);

    if (Object.keys(drizzleState.accounts).length === 0) {
      return (
        <div style={{padding: "140px 0px", display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
          <img src={MetamaskLogoPath} className={classes.meta}/>
          <Typography variant="display1" align="center">Please unlock Metamask to show contract data and load content creator.</Typography>
        </div>
      )
    }
    // If Drizzle founds an error while loading content creator, render 404 not found component.
    if (contentCreatorExists == "not_found") {
      return (<Error404 />);
    }

    return (
      <div className={classes.gridContainer} >
        <Grid container spacing={24}>
            <Grid item xs={12} sm={9}>
              <Top pointer={this.state.pointer} isAddress={this.state.isAddress} address={this.state.address}/>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={3}>
                  <MessageInbox address={this.state.address} />
                  <LeftSidebar pointer={this.state.pointer} isAddress={this.state.isAddress}/>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Description pointer={this.state.pointer} isAddress={this.state.isAddress}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Tiers routerId={this.props.match.params.contentCreator} pointer={this.state.pointer} isAddress={this.state.isAddress} />
            </Grid>
        </Grid>
      </div>
    )
  }
}
 
export default withDrizzleContext(
  withStyles(styles)(ContentCreator)
);