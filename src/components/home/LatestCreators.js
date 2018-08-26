import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import withDrizzleContext from '../../util/withDrizzleContext';
import { Link } from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import MetamaskLogoPath from '../../metamask_logo.svg';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import defaultAvatar from '../../default_avatar.png'
import classNames from "classnames"


const styles = theme => ({
  LatestCreators: {
    padding: "0px 10px 60px",
  },
  title: {
    margin: 0,
    color: 'black',
    fontFamily: 'Oswald, Roboto, Arial Narrow, sans-serif'
  },
  avatar: {
    width: 160,
    height: 160,
  },
  paperItem: {
    padding: 30,
    margin: "20px 60px",
    textDecorationColor: 'orange'
  },
  contentCreatorTitle: {
    fontFamily: 'Oswald, Roboto, Arial Narrow, sans-serif',
  },
  meta: {
    width: 300
  }
})
class LatestCreators extends Component {
  state = {
    contentCreators: []
  }
  async componentDidMount() {
    const { drizzleState, drizzle } = this.props;

    const drizzleMecenas = drizzle.contracts.Mecenas;
    const web3 = drizzle.web3;
    const mecenasWeb3 = new web3.eth.Contract(drizzleMecenas.abi, drizzleMecenas.address);
    const events = await mecenasWeb3.getPastEvents(
      'newContentCreator',
      {
        fromBlock: 0,
        toBlock: 'latest',
      }
    );
    this.setState({
      contentCreators: events.map(m => {
        const values = m.returnValues;
        return ({
          nickname: values.nickname && values.nickname.length ? web3.utils.hexToUtf8(values.nickname) : "Anonymous",
          address: values.contentCreatorAddress,
          ipfsAvatar: values.ipfsAvatar
        })
      })
    })
  }

  render() {
    const { classes, drizzleState, drizzle } = this.props;
    const { contentCreators } = this.state;
    
    if (Object.keys(drizzleState.accounts).length === 0) {
      return (
        <div style={{padding: "30px 0px", display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
          <img src={MetamaskLogoPath} className={classes.meta}/>
          <Typography variant="display1" align="center">Please unlock Metamask to show contract data and load the latest content creators.</Typography>
        </div>
      )
    }
    
    const contentCreatorsDOM = contentCreators.length > 0 ?
      contentCreators.slice(-3).map((contentCreator, index) => {
        const profileUrl = !!contentCreator.ipfsAvatar.length ? `https://ipfs.io/ipfs/${contentCreator.ipfsAvatar}` : defaultAvatar;
        return (
          <Paper key={index} component={Link} to={`/${contentCreator.address}`} className={classes.paperItem} elevation={2}>
            <Avatar
              className={classNames(classes.avatar)}
              alt={contentCreator.nickname}
              src={profileUrl}
            />
            <Typography variant="display1" className={classes.contentCreatorTitle} align="center">
              {contentCreator.nickname}
            </Typography>
          </Paper>
        );
      }) :
      (
        <Paper className={classes.paperItem} elevation={1}>
          <Typography align="center" style={{marginTop: "20px"}}>Still no content creators here. Be the first one.</Typography>
        </Paper>
      )

    return (
      <div className={classes.LatestCreators}>
        <Typography variant="display1" align="center" className={classes.title}>Check out the latests content creators</Typography>
        <Grid container justify="center" alignItems="center">
          {contentCreatorsDOM}
        </Grid>
      </div>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(LatestCreators)
);
