import React, { PureComponent } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import ReactPlaceholder from 'react-placeholder';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withDrizzleContext from "../../util/withDrizzleContextSimple";
import { getContentCreator } from '../../mecenas-store/ContentCreator';
import { Link } from "react-router-dom";


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  tier: {
    padding: "22px 0"
  }

});

class Tier extends PureComponent {
  state = {
    loaded: false,
    title: '',
    price: '0.0',
    description: ''
  }

  async componentDidUpdate() {
    const loaded = this.state.loaded;
    if (!loaded) {
      const { drizzle, index, address } = this.props;

      const mecenas = drizzle.contracts.Mecenas;
      const bigIndex = drizzle.web3.utils.toBN(index.toString())
      const tier = await mecenas.methods.getTier(address, bigIndex).call();
      if (tier.title.length > 0 ) {
        this.setState({
          title: tier.title,
          price: drizzle.web3.utils.fromWei(tier.price, 'ether'),
          description: tier.description,
          loaded: true
        });
      }
    }
  }

  render() {
    const { classes, name, index } = this.props;

    return (
      <div className={classes.tier}>
        <Typography variant="display1">{this.state.title}</Typography>
        <Typography variant="subheading">{this.state.price} ETH per month</Typography>
        <Typography variant="body2" style={{marginTop: '10px'}}>{this.state.description}</Typography>
        <Button component={Link} to={`/be-mecenas/${name}?tier=${index}`} variant="contained" color="primary" className={classes.button}>
          SUPPORT WITH {this.state.price} ETH
        </Button>
      </div>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Tier)
);