import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import Face from '@material-ui/icons/Face';
import Favorite from '@material-ui/icons/Favorite';
import Info from '@material-ui/icons/Info';

const styles = {
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
};

class DrawerMenu extends Component {
  disableDrawer = () => {
    this.props.onDisableDrawer();
  }
  render() {
    const { classes, open } = this.props;
    const sideList = (
      <div className={classes.list}>
        <List component="nav">
          <ListItem button component={Link} to="/registry">
            <ListItemIcon>
              <Face />
            </ListItemIcon>
            <ListItemText primary="Create your profile" />
          </ListItem>
          <ListItem button component={Link} to="/kartojal" >
            <ListItemIcon>
              <Favorite/>
            </ListItemIcon>
            <ListItemText primary="Support the dev" />
          </ListItem>
        </List>
      </div>
    );

    return (
      <Drawer open={open} ModalProps={{ onBackdropClick: this.disableDrawer }}>
        <div
          tabIndex={0}
          role="button"
          onClick={this.disableDrawer}
          onKeyDown={this.disableDrawer}
        >
          {sideList}
        </div>
      </Drawer>
    );
  }
}

DrawerMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onDisableDrawer: PropTypes.func.isRequired
};

export default withStyles(styles)(DrawerMenu);