import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Card, {CardActions, CardContent} from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import Helpers from '../../util/helpers';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import withDrizzleContext from "../../util/withDrizzleContextSimple";
import { Link } from "react-router-dom";
import ReactPlaceholder from 'react-placeholder';
import { isDataLoaded } from '../../util/drizzle-utils';
import { getContentCreator } from '../../mecenas-store/ContentCreator';
import defaultAvatar from '../../default_avatar.png'
import Money from '@material-ui/icons/Money'

const styles = theme => ({
  avatar: {
    width: 150,
    height: 150
  },
  top: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: 20,
  },
  bar: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 1.6,
    paddingBottom: theme.spacing.unit * 1.6,
    marginTop: 20,
  },
  contentCreatorAvatar: {
    margin: "0 auto"
  },
  contentCreatorTitle: {
    'text-align': 'center',
    'text-decoration-color': theme.palette.secondary["main"],
    'text-decoration': 'underline'
  },
  stats: {
    display: 'flex',
    'align-items': "center",
    'justify-content': "center"
  },
  supportButton: {
    color: "white",
    [theme.breakpoints.down('xs')]: {
      padding: '15px 10px',
      width: '95%',
      margin: '0 auto'
    },
  },
  withdrawButton: {
    marginLeft: 4
  }
});

class Top extends Component {
  state = {
    withdrawTx: null
  }

  withdrawWage = async (e) => {
    e.preventDefault();
    
    const { drizzle, drizzleState } = this.props;
    const account = drizzleState.accounts[0];
    const mecenas = drizzle.contracts.Mecenas;
    const transactionId = mecenas.methods.monthlyWithdraw.cacheSend({from: account});
    // Set transaction stack index
    this.setState({ withdrawTx: transactionId })
  }
  render() {
    const { classes, theme, drizzleState, drizzle, pointer, isAddress, address } = this.props;
    const { withdrawTx } = this.state;

    const loaded = isAddress ?
      isDataLoaded(drizzleState, pointer, 'getContentCreator', 'Mecenas') :
      isDataLoaded(drizzleState, pointer, 'getContentCreatorByNickname', 'Mecenas')
    // Current metamask account same as content creator address
    const isContentCreator = drizzleState.accounts[0] == address;
    // Get content creator data
    const contentCreator = getContentCreator(drizzleState, pointer, isAddress);
    const profileUrl = !!contentCreator.ipfsAvatar.length ? `https://ipfs.io/ipfs/${contentCreator.ipfsAvatar}` : defaultAvatar;

    const wageStatus = new Date() >= contentCreator.payday? 'Available' : `Locked until ${contentCreator.payday.toLocaleString()}`; 
    let wageTxStatus = ""
    // Check if withdraw tx is in drizzleState
    if (drizzleState.transactions[withdrawTx]) {
      wageTxStatus = Helpers.capitalize(drizzleState.transactions[withdrawTx].status);
    }
    return (
      <div>
        <Paper className={classes.top} elevation={1}>
          <Grid container>
            <Grid item xs={12} sm={4}>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ReactPlaceholder  showLoadingAnimation className={classNames(classes.avatar, classes.contentCreatorAvatar)} type='round' ready={loaded} color='#E0E0E0' style={{ width: 100, height: 100 }}>
                <Avatar
                  className={classNames(classes.avatar, classes.contentCreatorAvatar)}
                  alt="Content creator name"
                  src={profileUrl}
                />
              </ReactPlaceholder>
              <div style={{'margin': '15px 0px'}}>
                <ReactPlaceholder showLoadingAnimation type='textRow' ready={loaded} color='#E0E0E0'>
                  <h1 className={classes.contentCreatorTitle} >
                    {contentCreator.nickname}
                  </h1>
                </ReactPlaceholder>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              { isContentCreator && (
                <div>
                  { wageStatus !== "Available" && (
                    <div>
                      <Typography variant="body2">Payday:</Typography>
                      <Typography variant="caption" style={{fontSize: "1em"}}>
                        {wageStatus}
                      </Typography>
                    </div>
                  )}
                  <Grid container style={{marginTop: 10}}>
                    <Button onClick={this.withdrawWage} variant="contained" color="secondary" size="large" className={classNames(classes.button, classes.withdrawButton)}>
                      Withdraw wage
                      <Money style={{marginLeft: 5}}/>
                    </Button>
                    <div>
                    { wageTxStatus.length > 0 && (
                      <Typography>
                        Tx Status: {wageTxStatus}
                      </Typography>
                    )}
                    </div>
                  </Grid>
                </div>
              )}
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.bar} elevation={1}>
          <Grid container spacing={24} >
            <Grid item className={classes.stats} xs={6} sm={4}>
              <ReactPlaceholder showLoadingAnimation type="rect" ready={loaded} style={{ display: 'inline-text', width: 25, height: 25 }}>
                <Typography variant="subheading" >
                  {contentCreator.totalMecenas} backers
                </Typography>
              </ReactPlaceholder>
              { loaded == false && <div>backers</div> }
            </Grid>
            <Grid item className={classes.stats} xs={6} sm={4}>
              <ReactPlaceholder showLoadingAnimation type="rect" ready={loaded} style={{ width: 25, height: 25 }}>
                <Typography variant="subheading" >
                  {contentCreator.wage} ETH per month
                </Typography>
              </ReactPlaceholder>
              { loaded == false && <span>ETH per month</span> }
            </Grid>
            <Grid item className={classes.stats} xs={12} sm={4}>
              <Button component={Link} to={`/be-mecenas/${contentCreator.nickname}`} variant="contained" color="secondary" size="large" className={classNames(classes.button, classes.supportButton)}>Be a Mecenas</Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Top)
);