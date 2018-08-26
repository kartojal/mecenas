import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import AccountInfo from './account/Account';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DrawerMenu from './DrawerMenu';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import Favorite from '@material-ui/icons/Favorite';

const styles = theme => ({
  mecenasTitle: {
    margin: "0 10px 0 0",
    flex: 1,
  },
  link: {
    "text-decoration": "none"
  },
  appToolbar: {
    "background-color": "#fff"
  },
  toolbarLink: {
    "text-decoration": "none",
    "text-transform": "uppercase",
    "margin": "0 10px"
  },
  button: {
    margin: "0 20px 0px 0px",
  },
  registryButton: {
    "background-color": "#fda941",
    [theme.breakpoints.down('xs')]: {
      display: "none",
    }
  },
  devButton: {
    [theme.breakpoints.down('xs')]: {
      display: "none",
    }
  },
  devButtonLabel: {
    color: "black"
  }
});

class MecenasToolbar extends Component {
  state = {
    openDrawer: false
  }
  handleDrawerOpen = () => {
    this.setState({openDrawer: true})
  }
  handleDrawerClose = () => {
    this.setState({openDrawer: false})
  }
  render() {
    const { classes } = this.props;
    const { openDrawer } = this.state;
    return (
        <AppBar position="static" className={classes.appToolbar}>
          <DrawerMenu open={openDrawer} onDisableDrawer={this.handleDrawerClose}/>
          <Toolbar>
            <IconButton
              color="secondary"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.mecenasTitle}>
              <Link className={classes.link} to="/">
                <h3 style={{color: "black"}}>Mecenas</h3>
              </Link>
            </Typography>
            <Button component={Link} to="/kartojal" variant="flat" classes={{label: classes.devButtonLabel}} className={classNames(classes.button, classes.devButton)}>
              Support the dev
              <Favorite color="error" style={{marginLeft: 5}}/>
            </Button>
            <Button component={Link} to="/registry" variant="raised" className={classNames(classes.button, classes.registryButton)}>Create your own page</Button>
            <AccountInfo accountIndex="0" units="ether" precision="3" />
          </Toolbar>
        </AppBar>
    )
  }
}

MecenasToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MecenasToolbar);