import React, { Component } from 'react'
import { Link } from 'react-router'
import { Player, ControlBar, BigPlayButton, PlayToggle, Shortcut } from 'video-react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ContentCreatorPosterPath from '../../media/ContentCreator.jpg';
import EtherPath from '../../media/ether.png';
import ContentCreatorVideoPath from '../../media/ContentCreator.mp4';
import "video-react/dist/video-react.css";
import LatestCreators from './LatestCreators';

const styles = theme => ({
  videoWrap: {
    height: 600,
    overflow: 'hidden',
    position: 'relative'
  },
  videoPlayer: {
    position: 'absolute',
    top: '-40%',
    'min-width': '100%', 
    'min-height': '100%', 
    width: 'auto',
    height: 'auto',
  },
  callToActionTitle:{
    padding: 10,
    position: 'absolute',
    right: '10%',
    "background-color": "rgba(255, 129, 0, 0.70)",
    top: '270px',
    [theme.breakpoints.down('xs')]: {
      top: '120px',
      left: '50%',
      width: "90%",
      transform: 'translate(-50%, -50%)'
    }
  },
  callToActionText: {
    color: "white"
  },
  callToActionButton:{
    padding: 15,
    position: 'absolute',
    top: '360px',
    right: '10%',
    "background-color": "rgba(255, 129, 0, 0.90)",
    [theme.breakpoints.down('xs')]: {
      top: '90%',
      left: '50%',
      width: "90%",
      transform: 'translate(-50%, -50%)'
    }
  },
  callToActionButtonText: {
    color: "white",
    fontSize: "1.4em"
  },
  callToActionEther: {
    position: 'absolute',
    top: '50%',
    opacity: 0.6,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    [theme.breakpoints.down('xs')]: {
      top: '60%',
    }
  },
  orangeContainer: {
    textAlign: "center",
    padding: "60px 10px",
  },
  title: {
    //color: 'rgba(255, 129, 0, 1)',
    color: 'black',
    '&> u': {
      textDecorationColor: 'rgba(255, 129, 0, 1)',
    },
    fontFamily: 'Oswald, Roboto, Arial Narrow, sans-serif'
  },
  body: {
    fontSize: '1.4em'
  }
});

class Home extends Component {
  componentDidMount() {
    this.refs.player.actions.toggleFullscreen=()=>{};
  }
  render() {
    const {classes} = this.props;


    return (
      <div className="homePage">
        <div className={classes.videoWrap}>
          <Player
            ref="player"
            autoPlay
            playsInline
            autoPlay={true}
            poster={ContentCreatorPosterPath}
            muted={true}
            fluid={false}
            className={classes.videoPlayer}
          >
            <source src={ContentCreatorVideoPath} />
            <BigPlayButton disabled/>
            <Shortcut clickable={false} />
            <ControlBar disabled />
          </Player>
          <img src={EtherPath} className={classes.callToActionEther}/>
          <Paper variant="raised" className={classes.callToActionTitle}> 
            <Typography variant="display1" className={classes.callToActionText}>Get Ether for your great content, from your followers.</Typography>
          </Paper>
          <Button variant="raised" className={classes.callToActionButton}>
            <Typography variant="button" className={classes.callToActionButtonText}>Create your own page here</Typography>
          </Button>
        </div>
        <div className={classes.orangeContainer}>
          <Typography variant="display1" className={classes.title}>Are you a <u>youtuber</u>, <u>streamer</u> or a <u>content creator</u>? Here you can ask support to your audience.</Typography>
          <Typography className={classes.body} style={{marginTop: 20}}>Users can help you monthly with a prepaid monthly subscription. There is three tiers.</Typography>
          <Typography className={classes.body}>Each tier gives to your supporter a different <b>ERC721</b> Badge. Plus all you want to give for their support!</Typography>
        </div>
        <LatestCreators />
      </div>
    )
  }
}

export default withStyles(styles)(Home);