import React, { PureComponent } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import ReactPlaceholder from 'react-placeholder';
import withDrizzleContext from "../../util/withDrizzleContextSimple";
import { getContentCreator } from '../../mecenas-store/ContentCreator';

// Core components
import Tier from './Tier'

const styles = theme => ({
  papers: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: 20,
  },
})

class Tiers extends PureComponent {
  state = {
    address: "",
    loaded: false
  }
  async componentDidUpdate() {
    if (!this.state.loaded) {
      const {classes, drizzle, isAddress, routerId} = this.props;
      if (isAddress) {
        this.setState({address: routerId, loaded: true});
        return;
      }
      const mecenas = drizzle.contracts.Mecenas;
      const rawNickname = drizzle.web3.utils.asciiToHex(routerId);
      const address = await mecenas.methods.getContentCreatorAddress(rawNickname).call()
      this.setState({address, loaded: true});
    }
  }
  render() {
    const { classes, name, drizzleState, pointer, isAddress } = this.props;

    const { nickname } = getContentCreator(drizzleState, pointer, isAddress);
    const address = this.state.address;
    return (
      <Paper className={classes.papers} elevation={1}>
        <Tier index={0} address={address} name={nickname} />
        <Divider />
        <Tier index={1} address={address} name={nickname} />
        <Divider />
        <Tier index={2} address={address} name={nickname} />
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Tiers)
);