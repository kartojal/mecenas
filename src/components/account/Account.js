import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withDrizzleContext from '../../util/withDrizzleContextSimple';

import Chip from '@material-ui/core/Chip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link } from 'react-router-dom';
import Promise from "bluebird";

/*
 * Create component.
 */

class AccountData extends Component {
  constructor(props, context) {
    super(props);

    this.precisionRound = this.precisionRound.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      tokenBalancePointer: "",
      selectedAddress: "",
      menu: null,
      loading: false,
      badges: []
    }
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }
/*
  async componentWillUpdate(nextProps, nextState) {
    const {selectedAddress} = this.state; 

    const { accounts } = nextProps.drizzleState; 
    const newAddress = accounts[accountIndex]
    if (selectedAddress != newAddress) {
      tokenBalancePointer = drizzle.contracts.BadgesLedger.methods.balanceOf.cacheCall(newAddress);
      this.setState({
        selectedAddress: newAddress,
        tokenBalancePointer: tokenBalancePointer
      })
    }
  }
*/
  componentWillReceiveProps(nextProps) {
    const {selectedAddress} = this.state; 
    const {drizzle, accountIndex, drizzleState} = nextProps
    const { accounts } = drizzleState; 
    const newAddress = accounts[nextProps.accountIndex]
    if (newAddress && selectedAddress != newAddress) {
      const tokenBalancePointer = drizzle.contracts.BadgesLedger.methods.balanceOf.cacheCall(newAddress);
      this.setState({
        selectedAddress: newAddress,
        tokenBalancePointer: tokenBalancePointer
      })
    }
  }

  componentDidMount() {
    const { drizzleState, drizzle, accountIndex} = this.props;
    const {selectedAddress} = this.state;
    const { accounts } = drizzleState; 
    const currentAddress = accounts[accountIndex];

    this.setState({
      currentAddress: currentAddress
    })
  }

  // Load ERC721 URI tokens
  handleClick = async event => {
    this.setState({menu: event.currentTarget, loading: true, badges: []})

    const { drizzleState, drizzle} = this.props;
    const { selectedAddress, tokenBalancePointer} = this.state;
    const BadgesLedgerState = drizzleState.contracts.BadgesLedger;
    const { BadgesLedger, Mecenas } = drizzle.contracts;
    if (tokenBalancePointer in BadgesLedgerState.balanceOf) {
      const tokensRaw = BadgesLedgerState.balanceOf[tokenBalancePointer].value
      const mecenasBadges = await Promise.map(new Array(parseInt(tokensRaw)), (x, index) =>
        Mecenas.methods.mecenasBadges(selectedAddress, drizzle.web3.utils.toBN(index)).call()
      )
      const tokenUris = await Promise.map(mecenasBadges,(badge) =>
        BadgesLedger.methods.tokenURI(badge.tokenId).call()
      )
      const badges = mecenasBadges.map((badge, index) => ({
        contentCreatorAddress: badge.contentCreatorAddress,
        tokenId: badge.tokenId,
        uri: tokenUris[index]
      }));
      this.setState({
        loading: false,
        badges: badges
      })
      return;
    }
    this.setState({
      loading: false
    })

  }

  handleClose = () => {
    this.setState({menu: null})
  }
  render() {
    const { drizzleState, drizzle} = this.props;
    const { selectedAddress, tokenBalancePointer, menu, loading, badges} = this.state;
    const { accounts, accountBalances } = drizzleState;
    const { web3 } = drizzle;
    const { BadgesLedger } = drizzleState.contracts;
    let tokenBalance = 0;
    let badgesDOM = (
      <MenuItem>
        No badges found.
      </MenuItem>
    )

    // No accounts found.
    if(Object.keys(accounts).length === 0) {
      return (
        <span>Initializing...</span>
      )
    }

    // Get account address and balance.
    const address = accounts[this.props.accountIndex]
    let balance = accountBalances[address];
    const units = this.props.units ? this.props.units.charAt(0).toUpperCase() + this.props.units.slice(1) : 'Wei'
    if (!balance) {
      return (
        <span>Initializing...</span>
      )
    }
    // Convert to given units.
    if (this.props.units) {
      balance = web3.utils.fromWei(balance, this.props.units)
    }

    // Adjust to given precision.
    if (this.props.precision) {
      balance = this.precisionRound(balance, this.props.precision)
    }
    // Check ERC721 Badges balance
    if (tokenBalancePointer in BadgesLedger.balanceOf) {
      const tokensRaw = BadgesLedger.balanceOf[tokenBalancePointer].value
      tokenBalance = tokensRaw.toString();
    }
    if (badges.length > 0) {
      badgesDOM = badges.map((x, index) => {
        const partialAddress = x.contentCreatorAddress.substring(0, 12);
        return (
          <MenuItem key={index}>
            <Link to={`/${x.contentCreatorAddress}`} style={{color: "black", textDecoration: "none"}}>
              {x.uri} - {partialAddress}
            </Link>
          </MenuItem>
        )
      })
    }
    return(
      <div className="eth-account">
        <h4>{address}</h4>
        <div>
          <div>{balance} {units}</div>
          <Chip
            label={`${tokenBalance} Badge${tokenBalance !== "1" ? "s" : ""}`}
            aria-owns={menu ? 'simple-menu' : null}
            aria-haspopup="true"
            onClick={this.handleClick}
          />
          <Menu
            id="simple-menu"
            anchorEl={menu}
            open={Boolean(menu)}
            onClose={this.handleClose}
          >
            <MenuItem>Level - Content Creator</MenuItem>
            {loading && <MenuItem>
                <CircularProgress />
                <ListItemText primary="Loading badges" /> 
            </MenuItem>}
            {!loading && (badgesDOM)}
          </Menu>
        </div>
      </div>
    )
  }
}

export default withDrizzleContext(AccountData)